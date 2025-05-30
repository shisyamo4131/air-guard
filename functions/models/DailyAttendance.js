import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'

/**
 * dayjs
 */
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js'
import minMax from 'dayjs/plugin/minMax.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

import { calcOverlapMinutes, getNighttimeRange } from '../modules/utils.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/DailyAttendance.js'
import Employee from './Employee.js'
import { EmployeeContractMinimal } from './EmployeeContract.js'
import { LeaveRecordMinimal } from './LeaveRecord.js'
import { OperationWorkResultMinimal } from './OperationWorkResult.js'

dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(isoWeek)
dayjs.extend(minMax)
dayjs.extend(utc)
dayjs.extend(timezone)

const firestore = getFirestore()
const BATCH_LIMIT = 500

/**
 * ## DailyAttendance
 *
 * - 従業員の日ごと出勤簿に該当するドキュメントのデータモデルです。
 * - propsDefinition.DailyAttendance でのプロパティ定義を Object.defineProperty で上書きし、
 *   employeeContracts プロパティや operationWorkResults プロパティで受け取った値で勤務時間などの
 *   計算結果を返すようにしています。
 *
 * @version 1.1.0
 * @author shisyamo4131
 * @updates
 * - version 1.1.0 - 2024-10-16 - createInRange をバッチ処理に変更
 *                                updateWeeklyAttendance をバッチ処理に変更
 *                                leaveRecord プロパティを追加し、customClassMap を更新
 * - version 1.0.0 - 2024-10-09 - 初版作成
 */
export default class DailyAttendance extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'DailyAttendances'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    employeeContracts: EmployeeContractMinimal,
    operationWorkResults: OperationWorkResultMinimal,
    leaveRecord: LeaveRecordMinimal,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.tokenMap
    /**
     * employeeContractsをプロパティとして保持できるようにしたので、dayTypeとisNextDayLegalHolidayをObject.definePropertyで定義したい。
     */
    Object.defineProperties(this, {
      dayOfWeek: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.date) return ''
          return dayjs(this.date).format('ddd').toLowerCase()
        },
        set(v) {},
      },
      dayType: {
        configurable: true,
        enumerable: true,
        get() {
          // 日付や契約データが存在しない場合は 'undefined' を返す
          if (!this.date) return 'undefined'
          if (
            !Array.isArray(this.employeeContracts) ||
            !this.employeeContracts.length
          )
            return 'undefined'

          // employeeContracts を一度だけソートする
          const sortedContracts = [...this.employeeContracts].sort((a, b) =>
            a.startDate > b.startDate ? 1 : -1
          )

          // 該当する契約を見つける
          const applicableContract = sortedContracts.find((contract) => {
            return (
              contract.startDate <= this.date &&
              (!contract.expiredDate || contract.expiredDate >= this.date)
            )
          })

          // 該当する契約がない場合 'undefined' を返す
          if (!applicableContract) return 'undefined'

          // 就業規則を取得 -> 該当がなければ undefined を返す
          const workRegulation = applicableContract.workRegulation
          if (!workRegulation) return 'undefined'

          // 一旦、就業規則に沿った dayType を設定
          let result = ''
          if (workRegulation.scheduledWorkDays.includes(this.dayOfWeek)) {
            result = 'scheduled'
          } else if (workRegulation.legalHoliday === this.dayOfWeek) {
            result = 'legal-holiday'
          } else {
            result = 'non-statutory-holiday'
          }

          // `scheduled` で isHolidayWorkDay が false かつ holidays に当該日が存在する場合は 'non-statutory-holiday' を設定
          if (
            result === 'scheduled' &&
            !workRegulation.isHolidayWorkDay &&
            workRegulation.holidays.includes(this.date)
          ) {
            result = 'non-statutory-holiday'
          }

          // 休暇申請がある場合の処理
          if (this.leaveRecord && this.leaveRecord.docId) {
            /**
             * 下記条件を満たす場合、振替出勤日と判断して scheduled を返す
             * - leaveRecord の leaveType が `substitute`
             * - leaveRecord の substituteWorkDate が 当該日
             */
            const isSubstituteWork =
              this.leaveRecord?.leaveType === 'substitute' &&
              this.leaveRecord?.substituteWorkDate === this.date
            if (isSubstituteWork) result = 'scheduled'

            /**
             * 下記条件を満たす場合、振替休日と判断
             * - leaveRecord の leaveType が `substitute`
             * - leaveRecord の date が 当該日
             * - substitutedDayType を設定
             */
            const isSubstituted =
              this.leaveRecord?.leaveType === 'substitute' &&
              this.leaveRecord?.date === this.date
            // 運用上かなりイレギュラーだが、振替の振替があるとここがうまくいかないのでは？
            if (isSubstituted) result = this.leaveRecord.substitutedDayType
          }

          return result
        },
        set(v) {},
      },
      /**
       * 2024-10-14 added
       * とりあえず総労働時間が0より大きければ出勤に。
       */
      attendanceStatus: {
        configurable: true,
        enumerable: true,
        get() {
          // 日付未設定または勤務実績も休暇記録もなしの場合は undefined
          if (
            !this.date ||
            (!this.totalWorkingMinutes && !this.leaveRecord?.docId)
          ) {
            return 'undefined'
          }

          // 出勤実績があれば present
          if (this.totalWorkingMinutes > 0) {
            return 'present'
          }

          // 休暇記録があれば leaveType に従う
          return this.leaveRecord.leaveType || 'undefined'
        },
      },
      isNextDayLegalHoliday: {
        configurable: true,
        enumerable: true,
        get() {
          // 日付や契約データが存在しない場合は false を返す
          if (!this.nextDay) return false
          if (
            !Array.isArray(this.employeeContracts) ||
            !this.employeeContracts.length
          )
            return false

          // employeeContracts を一度だけソートする
          const sortedContracts = [...this.employeeContracts].sort((a, b) =>
            a.startDate > b.startDate ? 1 : -1
          )

          // 該当する契約を見つける
          const applicableContract = sortedContracts.find((contract) => {
            return (
              contract.startDate <= this.nextDay &&
              (!contract.expiredDate || contract.expiredDate >= this.nextDay)
            )
          })

          // 該当する契約がない場合は false を返す
          if (!applicableContract) return false

          // nextDayOfWeek を計算（必要に応じて dayjs ライブラリなどを使用）
          const nextDayOfWeek = dayjs(this.nextDay).format('ddd').toLowerCase()

          // 法定休日かどうかを判定
          const isLegalHoliday =
            applicableContract.workRegulation.legalHoliday === nextDayOfWeek

          return isLegalHoliday
        },
        set(v) {},
      },
      nextDay: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.date) return ''
          return dayjs(this.date).add(1, 'day').format('YYYY-MM-DD')
        },
        set(v) {},
      },
      nextDayOfWeek: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.nextDay) return ''
          return dayjs(this.nextDay).format('ddd').toLowerCase()
        },
        set(v) {},
      },

      /**
       * 始業時刻
       * - 稼働実績のうち、一番早い時刻をタイムスタンプで返します。
       * - 稼働実績が存在しない場合は無条件で null を返します。
       * @refact 2025-01-23
       */
      startTime: {
        configurable: true,
        enumerable: true,
        get() {
          // operationWorkResults が空の場合は null を返す
          if (!this.operationWorkResults.length) return null

          // 各エントリの終了時刻を dayjs オブジェクトとして取得
          const times = this.operationWorkResults.map((entry) => {
            return dayjs.tz(
              `${entry.date} ${entry.startTime}`,
              'YYYY-MM-DD HH:mm',
              'Asia/Tokyo'
            )
          })

          // 最も早い時刻を取得し、Date オブジェクトとして返す
          return dayjs.min(times).toDate()
        },
        set(v) {},
      },

      /**
       * 終業時刻
       * - 稼働実績のうち、一番遅い時刻をタイムスタンプで返します。
       * - 稼働実績が存在しない場合は無条件で null を返します。
       * @refact 2025-01-23
       */
      endTime: {
        configurable: true,
        enumerable: true,
        get() {
          // operationWorkResults が空の場合は null を返す
          if (!this.operationWorkResults.length) return null

          // 各エントリの終了時刻を dayjs オブジェクトとして取得
          const times = this.operationWorkResults.map((entry) => {
            const time = dayjs.tz(
              `${entry.date} ${entry.endTime}`,
              'YYYY-MM-DD HH:mm',
              'Asia/Tokyo'
            )
            return entry.endAtNextday ? time.add(1, 'day') : time
          })

          // 最も遅い時刻を取得し、Date オブジェクトとして返す
          return dayjs.max(times).toDate()
        },
        set(v) {},
      },

      /**
       * 休憩時間
       * - 稼働実績の休憩時間の合計を返します。
       * - 稼働実績が存在しない場合は無条件で 0 を返します。
       * @refact 2025-01-23
       */
      breakMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          // operationWorkResults が空の場合は 0 を返す
          if (!this.operationWorkResults.length) return 0

          // breakMinutes の合計を取得して返す
          return this.operationWorkResults.reduce(
            (sum, i) => sum + i.breakMinutes,
            0
          )
        },
        set(v) {},
      },

      /*************************************************************
       * 総労働時間（分）
       * - 始業時刻と終業時刻から総労働時間を計算して分単位で返します。
       * - 休憩時間が差し引かれます。
       * @refact 2025-01-23
       *************************************************************/
      totalWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          // 必要なプロパティが存在しない場合は 0 を返す
          if (
            !this.startTime ||
            !this.endTime ||
            typeof this.breakMinutes !== 'number'
          ) {
            return 0
          }

          // startTime と endTime の差分をミリ秒から分に変換
          const diffInMinutes =
            (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60)

          // 実働時間から休憩時間を引く
          const totalMinutes = diffInMinutes - this.breakMinutes

          // 実働時間が負の場合は 0 を返す
          return Math.max(totalMinutes, 0)
        },
        set(v) {},
      },

      /*************************************************************
       * 翌日労働時間（分）
       * - 総労働時間から当日労働時間を差し引いた時間を分単位で返します。
       * - 休憩時間は総労働時間から差し引かれているため考慮する必要はありません。
       * @refact 2025-01-23
       *************************************************************/
      nextDayWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          return this.totalWorkingMinutes - this.currentDayWorkingMinutes
        },
        set(v) {},
      },

      /*************************************************************
       * 当日分労働時間（分）
       * - 始業時刻と終業時刻から当日分の労働時間を計算して返します。
       * - 休憩時間は当日分労働時間から差し引けるだけ差し引かれます。
       * @refact 2025-01-23
       *************************************************************/
      currentDayWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          // 開始時間または終了時間が存在しない場合は 0 を返す
          if (!this.startTime || !this.endTime) return 0

          // 開始時間を dayjs オブジェクトとして取得
          const from = dayjs(this.startTime).tz('Asia/Tokyo')

          // 終了時間が翌日を超えないように制限
          const deadline = from.clone().startOf('day').add(1, 'day')
          const to = dayjs.min(dayjs(this.endTime), deadline)

          // 開始時間と終了時間のオーバーラップを計算し分単位に変換
          const overlap = Math.max(0, to.diff(from, 'milliseconds'))
          const overlapMinutes = Math.floor(overlap / (1000 * 60))

          // 休憩時間を差し引けるだけ差し引く
          const result = Math.max(0, overlapMinutes - this.breakMinutes)

          // 結果を返す
          return result
        },
        set(v) {},
      },

      holidayWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          let holidayWorkingMinutes = 0

          // dayType が 'legal-holiday' であれば、当日労働時間を追加
          if (this.dayType === 'legal-holiday') {
            holidayWorkingMinutes += this.currentDayWorkingMinutes || 0
          }

          // nextDayType が 'legal-holiday' であれば、翌日労働時間を追加
          if (this.nextDayType === 'legal-holiday') {
            holidayWorkingMinutes += this.nextDayWorkingMinutes || 0
          }

          // 合計した休日労働時間を返す
          return holidayWorkingMinutes
        },
        set(v) {},
      },
      scheduledWorkMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          // 日付や契約データが存在しない場合は 0 を返す
          if (!this.date) return 0
          if (
            !Array.isArray(this.employeeContracts) ||
            !this.employeeContracts.length
          )
            return 0

          // 所定労働日でなければ 0 を返す
          if (this.dayType !== 'scheduled') return 0

          // employeeContracts をソートして該当する契約を見つける
          const sortedContracts = [...this.employeeContracts].sort((a, b) =>
            a.startDate > b.startDate ? 1 : -1
          )

          // 該当する契約を見つける
          const applicableContract = sortedContracts.find((contract) => {
            return (
              contract.startDate <= this.date &&
              (!contract.expiredDate || contract.expiredDate >= this.date)
            )
          })

          // 該当する契約がない場合 0 を返す
          if (!applicableContract) return 0

          // 契約が存在する場合は、その契約の規定労働時間を返す
          return applicableContract.workRegulation.scheduledWorkMinutes || 0
        },
        set(v) {},
      },
      scheduledWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          // dayType が 'scheduled' でない場合は 0 を返す
          if (this.dayType !== 'scheduled') return 0

          // scheduledWorkMinutes が存在しない場合は 0 を返す
          if (typeof this.scheduledWorkMinutes !== 'number') return 0

          // currentDayWorkingMinutes プロパティを利用して、当日分の実働時間を取得
          let workingMinutes = this.currentDayWorkingMinutes || 0

          // 翌日が法定休日の場合、当日分の労働時間のみを計算
          if (this.isNextDayLegalHoliday) {
            workingMinutes = this.currentDayWorkingMinutes || 0
          } else {
            // 翌日が法定休日でない場合は、総労働時間を取得
            workingMinutes = this.totalWorkingMinutes || 0
          }

          // 合計が scheduledWorkMinutes を超えないようにする
          return Math.min(workingMinutes, this.scheduledWorkMinutes)
        },
        set(v) {},
      },
      /**
       * 所定外労働時間
       * - 総労働時間のうち、所定労働時間を超えた労働時間です。
       * - dayType によって計算方法が異なります。
       * - 所定労働日（scheduled）の場合
       *   総労働時間のうち、所定労働時間を超過した分です。ただし、日をまたがっており、かつ翌日が法定休日である場合は当日労働時間のうち所定労働時間を超過した分となります。
       * - 法定外休日（non-statutory-holiday）の場合
       *   総労働時間がそのまま反映されます。ただし、日をまたがっており、かつ翌日が法定休日である場合は当日労働時間が反映されます。
       * - 法定休日（legal-holiday）の場合
       *   0分になります。ただし、日をまたがっており、かつ翌日が法定休日でない場合は翌日労働時間が反映されます。
       * - 未定（undefined）の場合
       *   0分になります。
       */
      nonScheduledWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          switch (this.dayType) {
            case 'scheduled':
              if (
                this.nextDayWorkingMinutes > 0 &&
                this.isNextDayLegalHoliday
              ) {
                return Math.max(
                  this.currentDayWorkingMinutes - this.scheduledWorkMinutes,
                  0
                )
              } else {
                return Math.max(
                  this.totalWorkingMinutes - this.scheduledWorkMinutes,
                  0
                )
              }
            case 'non-statutory-holiday':
              if (
                this.nextDayWorkingMinutes > 0 &&
                this.isNextDayLegalHoliday
              ) {
                return Math.max(this.currentDayWorkingMinutes, 0)
              } else {
                return Math.max(this.totalWorkingMinutes, 0)
              }
            case 'legal-holiday':
              if (
                this.nextDayWorkingMinutes > 0 &&
                !this.isNextDayLegalHoliday
              ) {
                return Math.max(this.nextDayWorkingMinutes, 0)
              } else {
                return 0
              }
            default:
              return 0
          }

          // // 総労働時間（totalWorkingMinutes）と所定労働時間（scheduledWorkMinutes）を取得
          // const totalWorkingMinutes = this.totalWorkingMinutes || 0
          // const scheduledWorkMinutes = this.scheduledWorkMinutes || 0

          // // 翌日が法定休日かどうか、かつ日をまたいでいるかを確認
          // const isNextDayHoliday = this.isNextDayLegalHoliday

          // // 日をまたいでいる場合は、当日分の労働時間が基準 -> そうでなければ総労働時間が基準
          // const workingMinutes = isNextDayHoliday
          //   ? this.currentDayWorkingMinutes || 0
          //   : totalWorkingMinutes

          // // 基準時間が所定労働時間を超えた分を計算
          // const nonScheduledMinutes = workingMinutes - scheduledWorkMinutes

          // // 結果が負の場合は 0 を返す（所定外労働時間が負になるのを防ぐ）
          // return Math.max(nonScheduledMinutes, 0)
        },
        set(v) {},
      },
      /**
       * 法定内残業時間
       * - 所定労働時間（scheduledWorkMinutes）を超過し、法定労働時間上限である8時間以内の労働時間（分）です。
       * - 所定外労働時間を振り分けますが、dayType によって計算方法が変わります。
       * - 所定労働日（scheduled）の場合
       *   所定外労働時間のうち、所定内労働時間と法定労働時間上限の差を最大値として法定内労働時間に振り分けます。
       * - 法定外休日（non-statutory-holiday）の場合
       *   法定内残業時間、法定外残業時間への振り分けが週の働き方によって変わります。ここでは無条件で0を返します。
       * - 法定休日（legal-holiday）の場合
       *   日をまたがっていない場合、すべて休日労働時間となるため所定外労働時間は0になっているはずです。
       *   日をまたがっており、翌日が法定休日であった場合も所定外労働時間は0になっているはずです。
       *   日をまたがっており、翌日が法定休日でなかった場合にのみ所定外労働時間が計上されています。
       *   週の働き方によって振り分けが変わるため、ここでは無条件で0を返します。
       * - 未定（undefined）の場合
       *   無条件で0を返します。
       */
      statutoryOvertimeMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          switch (this.dayType) {
            case 'scheduled':
              return Math.min(
                480 - this.scheduledWorkingMinutes,
                this.nonScheduledWorkingMinutes
              )
            case 'non-statutory-holiday':
              return 0
            case 'legal-holiday':
              return 0
            default:
              return 0
          }
        },
        set(v) {},
      },
      /**
       * 法定外残業時間
       * - 法定労働時間の上限である8時間を超えた労働時間（分）です。
       * - 労働基準法上、割増賃金の支払いが義務付けられています。
       * - dayType によって計算方法が変わります。
       * - 所定労働日（scheduled）の場合
       *   総労働時間のうち、8時間を超過した時間を返します。ただし、日をまたがっており、翌日が法定休日である場合は当日労働時間のうち8時間を超えた分を返します。
       * - 法定外休日（non-statutory-holiday）の場合
       *   法定内残業時間、法定外残業時間への振り分けが週の働き方によって変わります。ここでは無条件で0を返します。
       * - 法定休日（legal-holiday）の場合
       *   日をまたがっていない場合、すべて休日労働時間となるため所定外労働時間は0になっているはずです。
       *   日をまたがっており、翌日が法定休日であった場合も所定外労働時間は0になっているはずです。
       *   日をまたがっており、翌日が法定休日でなかった場合にのみ所定外労働時間が計上されています。
       *   週の働き方によって振り分けが変わるため、ここでは無条件で0を返します。
       * - 未定（undefined）の場合
       *   無条件で0を返します。
       */
      nonStatutoryOvertimeMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          switch (this.dayType) {
            case 'scheduled':
              if (
                this.nextDayWorkingMinutes > 0 &&
                this.isNextDayLegalHoliday
              ) {
                return Math.max(this.currentDayWorkingMinutes - 480, 0)
              } else {
                return Math.max(this.totalWorkingMinutes - 480, 0)
              }
            case 'non-statutory-holiday':
              return 0
            case 'legal-holiday':
              return 0
            default:
              return 0
          }
        },
        set(v) {},
      },

      /*************************************************************
       * 深夜労働時間（分）
       * @refact 2025-01-23
       *************************************************************/
      nighttimeWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.startTime || !this.endTime) return 0

          // 深夜手当の支給対象時間帯を用意
          const { before, after } = getNighttimeRange(this.startTime)

          // 前日、当日分のオーバーラップしている時間数（分）を取得
          const beforeNightMinutes = calcOverlapMinutes(
            { start: this.startTime, end: this.endTime },
            { start: before.start, end: before.end }
          )
          const currentNightMinutes = calcOverlapMinutes(
            { start: this.startTime, end: this.endTime },
            { start: after.start, end: after.end }
          )

          return beforeNightMinutes + currentNightMinutes
        },
        set(v) {},
      },
    })
  }

  /****************************************************************************
   * 指定された日付範囲に基づいて、期間中に在職している全従業員の出勤記録をバッチ処理で作成します。
   * - DailyAttendance クラスは雇用契約（EmployeeContract）、稼働実績（OperationWorkResult）をプロパティで受け取ることが可能で、
   *   これらを参照して労働日区分や各種労働時間、残業時間などを自動で計算してプロパティで提供します。
   * - 但し、週残（週の労働時間が40時間を超えた分）は単一ドキュメントでは計算できません。
   *
   * @param {Object} params - 入力パラメータ。
   * @param {string} params.from - 出勤記録の開始日（YYYY-MM-DD）。
   * @param {string} params.to - 出勤記録の終了日（YYYY-MM-DD）。
   * @param {string} [params.employeeId] - フィルタリング対象の従業員ID（オプション）。
   ****************************************************************************/
  static async createInRange({
    from = null,
    to = null,
    employeeId = null,
  } = {}) {
    // 引数のチェック
    if (!from || !to) {
      const message = `[createInRange] 必要な引数が指定されていません。`
      logger.error(message, { from, to })
      throw new Error(`${message}`)
    }

    try {
      // 期間内の DailyAttendance ドキュメントをすべて削除
      await this.#deleteInRange({ from, to, employeeId })

      let employeeIds = []
      if (employeeId) {
        employeeIds.push(employeeId)
      } else {
        // 期間内に在職している従業員データを取得
        const paramsA = { from, to }
        const employees = await Employee.getExistingEmployees(paramsA)
        employeeIds = employees.map(({ docId }) => docId)
      }

      // 従業員の雇用契約を取得
      const employeeContracts = (
        await Promise.all(
          employeeIds.map((employeeId) =>
            EmployeeContractMinimal.getEmployeeContracts({
              employeeId,
              from,
              to,
            })
          )
        )
      ).flat()

      // 従業員の稼働実績を取得
      const operationWorkResults = (
        await Promise.all(
          employeeIds.map((employeeId) =>
            OperationWorkResultMinimal.getOperationWorkResults({
              employeeId,
              from,
              to,
            })
          )
        )
      ).flat()

      // 休暇記録を取得
      const leaveRecordInstance = new LeaveRecordMinimal()
      const getLeaveRecords = async (employeeId) => {
        const queryRef = firestore
          .collection('LeaveRecords')
          .where('employeeId', '==', employeeId)
          .where('date', '>=', from)
          .where('date', '<=', to)
          .withConverter(leaveRecordInstance.converter())
        const querySnapshot = await queryRef.get()
        return querySnapshot.docs.map((doc) => doc.data())
      }
      const leaveRecords = (
        await Promise.all(
          employeeIds.map((employeeId) => getLeaveRecords(employeeId))
        )
      ).flat()

      // バッチ処理を開始する
      const batchArray = []
      let batchIndex = 0

      // 全従業員についてループ処理
      for (const employeeId of employeeIds) {
        // 日付ごとのループ
        const [fromDayjs, toDayjs] = [dayjs(from), dayjs(to)]
        for (
          let currentDate = fromDayjs;
          currentDate.isSameOrBefore(toDayjs);
          currentDate = currentDate.add(1, 'day')
        ) {
          const date = currentDate.format('YYYY-MM-DD')
          const docId = `${employeeId}-${date}`
          const instance = new this({
            date,
            employeeId,
            employeeContracts: employeeContracts.filter(
              (contract) => contract.employeeId === employeeId
            ),
            operationWorkResults: operationWorkResults.filter(
              (result) =>
                result.employeeId === employeeId && result.date === date
            ),
            leaveRecord:
              leaveRecords.find(
                (record) =>
                  record.employeeId === employeeId &&
                  (record.date === date || record.substituteWorkDate === date)
              ) || null,
          })

          // バッチの初期化
          if (batchIndex % BATCH_LIMIT === 0) batchArray.push(firestore.batch())

          // ドキュメントをバッチで作成
          const docRef = firestore.collection('DailyAttendances').doc(docId)
          instance.docId = docId
          instance.createAt = new Date()
          batchArray[batchArray.length - 1].set(docRef, instance.toObject())

          batchIndex++
        }
      }

      // すべてのバッチをコミット
      await Promise.all(batchArray.map((batch) => batch.commit()))

      // 処理完了のログを出力
      logger.info(
        `[createInRange] DailyAttendance ドキュメントの作成処理が完了しました。`,
        { from, to, employeeId }
      )
    } catch (error) {
      // エラー発生時のログとエラーメッセージ
      logger.error('[createInRange] 処理中にエラーが発生しました。', error) // eslint-disable-line no-console
      throw new Error('Failed to create attendance records: ' + error.message)
    }
  }

  /****************************************************************************
   * 指定された期間内の DailyAttendance ドキュメントを削除します。
   *
   * このメソッドは、指定された `from` から `to` の日付範囲に基づいて、
   * Firestore 内の DailyAttendance ドキュメントをバッチ処理で削除します。
   * バッチ削除に失敗した場合はエラーがスローされます。
   *
   * @param {Object} param0 - 入力パラメータ。
   * @param {string} param0.from - 削除する範囲の開始日（YYYY-MM-DD）。
   * @param {string} param0.to - 削除する範囲の終了日（YYYY-MM-DD）。
   * @param {string} [param0.employeeId] - フィルタリング対象の従業員ID（オプション）。
   * @throws {Error} from および to のパラメータが不足している場合、またはバッチ削除が失敗した場合にエラーがスローされます。
   ****************************************************************************/
  static async #deleteInRange({
    from = null,
    to = null,
    employeeId = null,
  } = {}) {
    // from と to が指定されていない場合、エラーをスロー
    if (!from || !to) {
      const message = `[deleteInRange] from と to が指定されていません。`
      logger.error(message, { from, to })
      throw new Error(message)
    }

    try {
      // クエリを作成
      const colRef = firestore.collection('DailyAttendances')
      let queryRef = colRef.where('date', '>=', from).where('date', '<=', to)
      if (employeeId) queryRef = queryRef.where('employeeId', '==', employeeId)
      const querySnapshot = await queryRef.get()

      if (querySnapshot.empty) {
        // ドキュメントが存在しない場合、処理を終了
        logger.info(
          `[deleteInRange] 削除対象のドキュメントが見つかりませんでした。`,
          { from, to }
        )
        return
      }

      // バッチ削除処理
      const batchArray = []
      querySnapshot.docs.forEach((doc, index) => {
        if (index % BATCH_LIMIT === 0) batchArray.push(firestore.batch())
        batchArray[batchArray.length - 1].delete(doc.ref)
      })

      // バッチのコミット処理
      await Promise.all(batchArray.map((batch) => batch.commit()))

      // 削除成功のログを出力
      logger.info(
        `[deleteInRange] DailyAttendance ドキュメントの削除処理が正常に完了しました。`,
        { from, to, employeeId }
      )
    } catch (error) {
      // エラーハンドリング
      const message = `[deleteInRange] DailyAttendance ドキュメントの削除中にエラーが発生しました。`
      logger.error(message, { from, to, employeeId, error })
      throw error
    }
  }

  /****************************************************************************
   * 指定された期間の週残を計算するためのメソッドです。
   * - createInRange で日単位の出勤簿ドキュメントが作成されますが、週残が反映されません。
   * - 指定された期間から週単位の出勤簿ドキュメントを読み込み、週残を計算して反映させます。
   * - 週の起算日は月曜日に固定されます。（ここは柔軟に対応できるように将来改修したい）
   * - 処理としては、一週間分の出勤簿ドキュメントを読み込み、dayType が scheduled であるドキュメントの
   *   所定内労働時間、法定内残業時間の合計（以下、週労働時間という）を取得します。
   *   週労働時間の上限である40時間（2400分）から週労働時間を差し引きます。（以下、法定内余剰時間という）
   *   法定外休日であるドキュメントの所定外労働時間を、法定内余剰時間を最大として法定内残業時間に振り分けます。
   *   法定内余剰時間を超過する分は法定外残業時間に振り分けます。
   *   法定休日であるドキュメントの所定外労働時間を、法定内余剰時間を最大として法定内残業時間に振り分けます。
   *   法定内余剰時間を超過する分は法定外残業時間に振り分けます。
   * @param {Object} params - 入力パラメータ。
   * @param {string} params.from - 出勤記録の開始日（YYYY-MM-DD）。
   * @param {string} params.to - 出勤記録の終了日（YYYY-MM-DD）。
   * @param {string} [params.employeeId] - 処理対象の従業員ID（オプション）。
   * @throws {Error} 処理が失敗した場合、または必須パラメータが不足している場合にエラーが発生します。
   ****************************************************************************/
  static async updateWeeklyAttendance({
    from = null,
    to = null,
    employeeId = null,
  }) {
    // from と to が指定されていない場合、エラーをスロー
    if (!from || !to) {
      const message = `[updateWeeklyAttendance] from と to が指定されていません。`
      logger.error(message, { from, to })
      throw new Error(message)
    }

    let minDate = ''
    let maxDate = ''

    try {
      // 一週間の単位を取得 -> 月曜日を開始とする一週間の単位が取得されるため from, to の範囲とは異なる
      const weeklyRanges = this.#getWeeklyRanges({ from, to })

      // 全対象期間の DailyAttendance ドキュメントを取得
      const colRef = firestore.collection('DailyAttendances')
      let queryRef = colRef
        .where('date', '>=', weeklyRanges[0].from)
        .where('date', '<=', weeklyRanges[weeklyRanges.length - 1].to)
      if (employeeId) queryRef = queryRef.where('employeeId', '==', employeeId)
      const querySnapshot = await queryRef.get()
      const dailyAttendancesAll = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), docRef: doc.ref }
      })

      // バッチを準備
      const batchArray = []
      let batchIndex = 0

      // 週単位で処理
      for (const weeklyRange of weeklyRanges) {
        ;[minDate, maxDate] = [weeklyRange.from, weeklyRange.to]

        // 対象週の DailyAttendance ドキュメントを取得
        const dailyAttendancesWeek = dailyAttendancesAll.filter(
          ({ date }) => date >= minDate && date <= maxDate
        )

        // 対象の DailyAttendance ドキュメントが存在する場合にのみ処理
        if (dailyAttendancesWeek.length > 0) {
          // 取得した DailyAttendance ドキュメントから employeeId を重複なしで取得
          const employeeIds = [
            ...new Set(
              dailyAttendancesWeek.map(({ employeeId }) => employeeId)
            ),
          ]

          // 従業員ごとにループ処理
          for (const employeeId of employeeIds) {
            // 対象従業員の DailyAttendance ドキュメントを取得
            const dailyAttendances = dailyAttendancesWeek.filter(
              (attendance) => attendance.employeeId === employeeId
            )

            // 所定労働日の出勤簿を取得
            const scheduledAttendances = dailyAttendances.filter(
              (doc) => doc.dayType === 'scheduled'
            )

            // 所定労働日の週労働時間を計算
            const weeklyWorkingMinutes = scheduledAttendances.reduce(
              (sum, i) => {
                return (
                  sum + i.scheduledWorkingMinutes + i.statutoryOvertimeMinutes
                )
              },
              0
            )

            // 法定内余剰時間を取得
            let excess = Math.max(2400 - weeklyWorkingMinutes, 0)

            // 法定外休日の出勤簿を取得
            const nonStatutoryAttendances = dailyAttendances.filter(
              (doc) => doc.dayType === 'non-statutory-holiday'
            )

            // 法定外休日の出勤簿について所定外労働時間を法定内・法定外残業時間に振り分ける
            for (const nonStatutoryAttendance of nonStatutoryAttendances) {
              // バッチを初期化
              if (batchIndex % BATCH_LIMIT === 0)
                batchArray.push(firestore.batch())

              // 法定内残業時間（所定外労働時間と法定内余剰時間のうち小さい方を採用）
              const statutoryOvertimeMinutes = Math.min(
                nonStatutoryAttendance.nonScheduledWorkingMinutes,
                excess
              )

              // 法定外残業時間（所定外残業時間から法定内残業時間を差し引く：最小0）
              const nonStatutoryOvertimeMinutes = Math.max(
                nonStatutoryAttendance.nonScheduledWorkingMinutes -
                  statutoryOvertimeMinutes,
                0
              )

              // 法定内残業時間と法定外残業時間を更新
              batchArray[batchArray.length - 1].update(
                nonStatutoryAttendance.docRef,
                {
                  statutoryOvertimeMinutes,
                  nonStatutoryOvertimeMinutes,
                }
              )

              batchIndex++

              // 法定内余剰時間を更新
              excess = Math.max(excess - statutoryOvertimeMinutes, 0)
            }

            // 法定休日の出勤簿を取得
            const legalHolidayAttendances = dailyAttendances.filter(
              (doc) => doc.dayType === 'legal-holiday'
            )

            // 法定休日の出勤簿について所定外労働時間を法定内・法定外残業時間に振り分ける
            for (const legalHolidayAttendance of legalHolidayAttendances) {
              // バッチを初期化
              if (batchIndex % BATCH_LIMIT === 0)
                batchArray.push(firestore.batch())

              // 法定内残業時間（所定外労働時間と法定内余剰時間のうち小さい方を採用）
              const statutoryOvertimeMinutes = Math.min(
                legalHolidayAttendance.nonScheduledWorkingMinutes,
                excess
              )

              // 法定外残業時間（所定外残業時間から法定内残業時間を差し引く：最小0）
              const nonStatutoryOvertimeMinutes = Math.max(
                legalHolidayAttendance.nonScheduledWorkingMinutes -
                  statutoryOvertimeMinutes,
                0
              )

              // 法定内残業時間と法定外残業時間を更新
              batchArray[batchArray.length - 1].update(
                legalHolidayAttendance.docRef,
                {
                  statutoryOvertimeMinutes,
                  nonStatutoryOvertimeMinutes,
                }
              )

              batchIndex++

              // 法定内余剰時間を更新
              excess = Math.max(excess - statutoryOvertimeMinutes, 0)
            }
          }
        }
      }
      await Promise.all(batchArray.map((batch) => batch.commit()))

      // 処理完了ログを出力
      logger.info(
        `[updateWeeklyAttendance] DailyAttendance の週残更新処理が完了しました。`,
        { from, to, employeeId }
      )
    } catch (error) {
      const message = `[updateWeeklyAttendance] 週残の更新処理でエラーが発生しました。従業員ID: ${employeeId}, 期間: ${minDate} から ${maxDate} まで。`
      logger.error(message, { from, to, employeeId, error }) // eslint-disable-line no-console
      throw new Error(message)
    }
  }

  /****************************************************************************
   * from と to から一週間単位の範囲を作成する関数
   * - 週の開始は月曜日とし、from が月曜日でない場合はさかのぼって月曜日に調整します。
   * - 各一週間の終了は必ず日曜日になります。
   * - 一週間は7日単位で作成され、複数の週の範囲が生成されます。
   *
   * @param {Object} param0 - from と to を含むオブジェクト
   * @param {string} param0.from - 処理開始の日付（YYYY-MM-DD 形式）
   * @param {string} param0.to - 処理終了の日付（YYYY-MM-DD 形式）
   * @returns {Array<Object>} 各一週間の範囲を含むオブジェクトの配列
   *  - 例: [{ from: '2024-09-02', to: '2024-09-08' }, { from: '2024-09-09', to: '2024-09-15' }]
   ****************************************************************************/
  static #getWeeklyRanges({ from, to }) {
    // from、to を dayjs に変換し、UTC+9（日本時間）で扱う
    const startDate = dayjs(from).utcOffset(9)
    const endDate = dayjs(to).utcOffset(9)

    // 週の開始日が月曜日でない場合、前の月曜日にさかのぼる
    const adjustedFrom =
      startDate.isoWeekday() === 1
        ? startDate
        : startDate.subtract(startDate.isoWeekday() - 1, 'day')

    const weeklyRanges = []
    let currentFrom = adjustedFrom

    // 一週間ごとの範囲を作成
    while (
      currentFrom.isBefore(endDate) ||
      currentFrom.isSame(endDate, 'day')
    ) {
      // 一週間後の日曜日を計算
      const currentTo = currentFrom.add(6, 'day')

      // 範囲を配列に追加
      weeklyRanges.push({
        from: currentFrom.format('YYYY-MM-DD'), // 月曜日
        to: currentTo.format('YYYY-MM-DD'), // 必ず日曜日
      })

      // 次の週に移動
      currentFrom = currentFrom.add(7, 'day')
    }

    return weeklyRanges
  }
}

/**
 * MonthlyAttendance クラス専用の DailyAttendance クラスです。
 * - DailyAttendance クラスから、MonthlyAttendance クラスに必要なプロパティのみを抽出したクラスです。
 * - 勤務時間などのプロパティが Object.defineProperty で計算されてしまうため、DailyAttendance クラスを
 *   継承するのではなく、FireModel 継承し、propsDefinition.DailyAttendance でプロパティ定義をしています。
 * @author shisyamo4131
 */
export class DailyAttendanceForMonthlyAttendance extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'DailyAttendances'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    operationWorkResults: OperationWorkResultMinimal,
    leaveRecord: LeaveRecordMinimal,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.employeeContracts
  }
}
