import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/DailyAttendance.js'
import Employee from './Employee.js'
import EmployeeContractForDailyAttendance from './EmployeeContractForDailyAttendance.js'
import OperationWorkResultForDailyAttendance from './OperationWorkResultForDailyAttendance.js'
dayjs.extend(isSameOrBefore)
dayjs.extend(isoWeek)
const firestore = getFirestore()
const BATCH_LIMIT = 500

/**
 * DailyAttendancesドキュメントデータモデル【物理削除】
 *
 * - 従業員の日ごと出勤簿に該当するドキュメントのデータモデルです。
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
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
    employeeContracts: EmployeeContractForDailyAttendance,
    operationWorkResults: OperationWorkResultForDailyAttendance,
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

          // dayType を決定する
          const isScheduled =
            applicableContract.workRegulation.scheduledWorkDays.includes(
              this.dayOfWeek
            )
          const isLegalHoliday =
            applicableContract.workRegulation.legalHoliday === this.dayOfWeek

          return isScheduled
            ? 'scheduled'
            : isLegalHoliday
            ? 'legal-holiday'
            : 'non-statutory-holiday'
        },
        set(v) {},
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
      startTime: {
        configurable: true,
        enumerable: true,
        get() {
          // operationWorkResults が空の場合は null を返す
          if (!this.operationWorkResults.length) return null

          // 最も早い startTime を取得
          const startTime = this.operationWorkResults.reduce((earliest, i) => {
            // earliest が null なら、最初の startTime を設定
            if (!earliest) return i.startTime

            // HH:MM 形式の文字列はそのまま比較できる
            return earliest < i.startTime ? earliest : i.startTime
          }, null)

          // startTime が null か確認して、日付を生成
          return startTime
            ? dayjs(`${this.date} ${startTime}`, 'YYYY-MM-DD HH:mm').toDate()
            : null
        },
        set(v) {},
      },
      endTime: {
        configurable: true,
        enumerable: true,
        get() {
          // operationWorkResults が空の場合は null を返す
          if (!this.operationWorkResults.length) return null

          // 最も遅い endTime を取得
          const endTime = this.operationWorkResults.reduce((latest, i) => {
            // endAtNextday が true の場合は翌日の日時として処理
            const endDate = i.endAtNextday
              ? dayjs(i.date).add(1, 'day').format('YYYY-MM-DD')
              : i.date

            const currentEndTime = dayjs(
              `${endDate} ${i.endTime}`,
              'YYYY-MM-DD HH:mm'
            )

            // latest が null なら、最初の endTime を設定
            if (!latest) return currentEndTime

            // 最新の endTime を保持
            return latest.isAfter(currentEndTime) ? latest : currentEndTime
          }, null)

          // endTime が null か確認して、Date オブジェクトとして返す
          return endTime ? endTime.toDate() : null
        },
        set(v) {},
      },
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
      totalWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          // date, startTime, endTime のどれかが存在しない場合は 0 を返す
          if (!this.startTime || !this.endTime) return 0

          // startTime と endTime が Date オブジェクトであるため、直接 diff を計算
          const diffInMinutes = (this.endTime - this.startTime) / (1000 * 60) // ミリ秒から分に変換

          // 実働時間から休憩時間を引く
          const totalMinutes = diffInMinutes - this.breakMinutes

          // 結果が負の場合は 0 を返す
          return Math.max(totalMinutes, 0)
        },
        set(v) {},
      },
      nextDayWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          // startTime, endTime, breakMinutes が存在しない場合は 0 を返す
          if (
            !this.startTime ||
            !this.endTime ||
            typeof this.breakMinutes !== 'number'
          )
            return 0

          // 日本標準時（UTC+9）で startTime と endTime を dayjs オブジェクトに変換
          const from = dayjs(this.startTime).utcOffset(9)
          const to = dayjs(this.endTime).utcOffset(9)

          // 翌日の 0:00 を取得（startTime の翌日を基準にする）
          const nextDayStart = dayjs(from)
            .utcOffset(9)
            .add(1, 'day')
            .startOf('day')

          // endTime が 0 時を超えているかを判定
          const isNextDay = to.isAfter(nextDayStart)

          // 日付を跨いでいない場合は 0 を返す
          if (!isNextDay) return 0

          // 当日の労働時間の合計を取得
          const minutesOnSameDay = nextDayStart.diff(from, 'minute')

          // 休憩時間を当日の労働時間から引く
          const breakTimeOnSameDay = Math.min(
            this.breakMinutes,
            minutesOnSameDay
          )
          const breakTimeRemaining = this.breakMinutes - breakTimeOnSameDay

          // 翌日分の労働時間を計算（残りの休憩時間を引く）
          const nextDayMinutes = to.diff(nextDayStart, 'minute')
          const nextDayWorkingMinutes = Math.max(
            nextDayMinutes - breakTimeRemaining,
            0
          )

          return nextDayWorkingMinutes
        },
        set(v) {},
      },
      currentDayWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          // 総労働時間と翌日分労働時間が存在しない場合は 0 を返す
          const totalWorkingMinutes = this.totalWorkingMinutes || 0
          const nextDayWorkingMinutes = this.nextDayWorkingMinutes || 0

          // 当日分労働時間を計算（総労働時間から翌日分を引く）
          const currentDayWorkingMinutes =
            totalWorkingMinutes - nextDayWorkingMinutes

          // 結果が負にならないように 0 以上の値を返す
          return Math.max(currentDayWorkingMinutes, 0)
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
      nighttimeWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.startTime || !this.endTime) return 0

          // 開始日時、終了日時を dayjs オブジェクトに変換
          const start = dayjs(this.startTime).utcOffset(9)
          const end = dayjs(this.endTime).utcOffset(9)

          // before の深夜時間帯 (前日22:00 ~ 当日5:00)
          const beforeNightStart = dayjs(this.startTime)
            .subtract(1, 'day')
            .set('hour', 22)
            .set('minute', 0)
            .utcOffset(9)
          const beforeNightEnd = dayjs(this.startTime)
            .set('hour', 5)
            .set('minute', 0)
            .utcOffset(9)

          // current の深夜時間帯 (当日22:00 ~ 翌日5:00)
          const currentNightStart = dayjs(this.startTime)
            .set('hour', 22)
            .set('minute', 0)
            .utcOffset(9)
          const currentNightEnd = dayjs(this.startTime)
            .add(1, 'day')
            .set('hour', 5)
            .set('minute', 0)
            .utcOffset(9)

          // 6つの日時オブジェクトを配列に入れて昇順に並び替え
          const times = [
            start,
            end,
            beforeNightStart,
            beforeNightEnd,
            currentNightStart,
            currentNightEnd,
          ].sort((a, b) => a - b)

          let beforeNightTime = 0
          let currentNightTime = 0

          // 4. beforeNightEnd より開始時間が前であれば、2番目と3番目の要素の差を計算
          if (start.isBefore(beforeNightEnd)) {
            beforeNightTime = times[2].diff(times[1], 'minute')
          }

          // 5. currentNightStart より終了時間が後であれば、4番目と5番目の要素の差を計算
          if (end.isAfter(currentNightStart)) {
            currentNightTime = times[4].diff(times[3], 'minute')
          }

          // 深夜労働時間の合計を返す
          return Math.max(beforeNightTime, 0) + Math.max(currentNightTime, 0)
        },
        set(v) {},
      },
    })
  }

  /****************************************************************************
   * 指定された日付範囲に基づいて、期間中に在職している全従業員の出勤記録をトランザクションで作成します。
   * - DailyAttendance クラスは雇用契約（EmployeeContract）、稼働実績（OperationWorkResult）をプロパティで受け取ることが可能で、
   *   これらを参照して労働日区分や各種労働時間、残業時間などを自動で計算してプロパティで提供します。
   * - 但し、週残（週の労働時間が40時間を超えた分）は単一ドキュメントでは計算できません。
   *
   * @param {Object} params - 入力パラメータ。
   * @param {string} params.from - 出勤記録の開始日（YYYY-MM-DD）。
   * @param {string} params.to - 出勤記録の終了日（YYYY-MM-DD）。
   * @param {string} [param0.employeeId] - フィルタリング対象の従業員ID（オプション）。
   * @throws {Error} トランザクションが失敗した場合、または必須パラメータが不足している場合はエラーが発生します。
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
      /**
       * 期間内の DailyAttendance ドキュメントをすべて削除
       * - 一度作成された後に退職手続きがされるなど、不要な DailyAttendance ドキュメントが残ることを回避します。
       */
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

      // すべての従業員をループ処理
      for (const employeeId of employeeIds) {
        // トランザクション
        await firestore.runTransaction(async (transaction) => {
          // 従業員の雇用契約を取得
          const params = { employeeId, from, to, transaction }
          const employeeContracts =
            await EmployeeContractForDailyAttendance.getEmployeeContracts(
              params
            )

          // 稼働勤務実績を取得
          const operationWorkResults =
            await OperationWorkResultForDailyAttendance.getOperationWorkResults(
              params
            )

          // 期間中の日付ごとに処理
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
              employeeContracts,
              operationWorkResults: operationWorkResults.filter(
                (result) =>
                  result.employeeId === employeeId && result.date === date
              ),
            })

            // ドキュメントを作成
            instance.create({ docId, transaction })
          }
        })
      }

      // 処理完了ログを出力
      logger.info(
        `[createInRange] DailyAttendance ドキュメントの作成処理が完了しました。`,
        { from, to }
      )
    } catch (error) {
      logger.error('Transaction failed: ', error) // eslint-disable-line no-console
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
   * @throws {Error} トランザクションが失敗した場合、または必須パラメータが不足している場合にエラーが発生します。
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
      // 一週間の単位を取得
      const weeklyRanges = this.#getWeeklyRanges({ from, to })

      // 週単位で処理
      for (const weeklyRange of weeklyRanges) {
        ;[minDate, maxDate] = [weeklyRange.from, weeklyRange.to]

        // 一旦、DailyAttendance ドキュメントを取得
        const colRef = firestore.collection('DailyAttendances')
        let queryRef = colRef
          .where('date', '>=', minDate)
          .where('date', '<=', maxDate)
        if (employeeId)
          queryRef = queryRef.where('employeeId', '==', employeeId)
        const querySnapshot = await queryRef.get()

        // 対象の DailyAttendance ドキュメントが存在する場合にのみ処理
        if (!querySnapshot.empty) {
          // 取得した DailyAttendance ドキュメントから employeeId を重複なしで取得
          const employeeIds = [
            ...new Set(querySnapshot.docs.map((doc) => doc.data().employeeId)),
          ]

          // 従業員ごとにトランザクション処理
          for (const employeeId of employeeIds) {
            await firestore.runTransaction(async (transaction) => {
              // トランザクション内で更新対象の DailyAttendance ドキュメントを取得
              const dailyAttendancesRef = firestore
                .collection('DailyAttendances')
                .where('date', '>=', minDate)
                .where('date', '<=', maxDate)
                .where('employeeId', '==', employeeId)
              const dailyAttendanceSnapshot = await transaction.get(
                dailyAttendancesRef
              )
              const dailyAttendances = dailyAttendanceSnapshot.docs.map(
                (doc) => {
                  return { docRef: doc.ref, ...doc.data() } // 後でドキュメントを更新するため doc.ref を追加しておく
                }
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
                transaction.update(nonStatutoryAttendance.docRef, {
                  statutoryOvertimeMinutes,
                  nonStatutoryOvertimeMinutes,
                })

                // 法定内余剰時間を更新
                excess = Math.max(excess - statutoryOvertimeMinutes, 0)
              }

              // 法定休日の出勤簿を取得
              const legalHolidayAttendances = dailyAttendances.filter(
                (doc) => doc.dayType === 'legal-holiday'
              )

              // 法定休日の出勤簿について所定外労働時間を法定内・法定外残業時間に振り分ける
              for (const legalHolidayAttendance of legalHolidayAttendances) {
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
                transaction.update(legalHolidayAttendance.docRef, {
                  statutoryOvertimeMinutes,
                  nonStatutoryOvertimeMinutes,
                })

                // 法定内余剰時間を更新
                excess = Math.max(excess - statutoryOvertimeMinutes, 0)
              }
            })
          }
        }
      }

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
