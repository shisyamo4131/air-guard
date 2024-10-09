import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/DailyAttendance.js'
import Employee from './Employee.js'
import EmployeeContractForDailyAttendance from './EmployeeContractForDailyAttendance.js'
dayjs.extend(isSameOrBefore)
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
      nonScheduledWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          // totalWorkingMinutes と scheduledWorkingMinutes が存在しない場合は 0 を返す
          const totalWorkingMinutes = this.totalWorkingMinutes || 0
          const scheduledWorkingMinutes = this.scheduledWorkingMinutes || 0

          // 翌日が法定休日かどうか、かつ日をまたいでいるかを確認
          const isNextDayHoliday = this.isNextDayLegalHoliday

          // 日をまたいでいる場合は、当日分の労働時間のみを計算
          const workingMinutes = isNextDayHoliday
            ? this.currentDayWorkingMinutes || 0
            : totalWorkingMinutes

          // 実働時間が所定労働時間を超えた分を計算
          const nonScheduledMinutes = workingMinutes - scheduledWorkingMinutes

          // 結果が負の場合は 0 を返す（所定外労働時間が負になるのを防ぐ）
          return Math.max(nonScheduledMinutes, 0)
        },
        set(v) {},
      },
      statutoryOvertimeMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          // 日をまたぎ、かつ翌日が法定休日である場合は当日労働時間を取得
          const workingMinutes = this.isNextDayLegalHoliday
            ? this.currentDayWorkingMinutes || 0
            : this.totalWorkingMinutes || 0

          // 所定労働時間が定義されていない場合は 0 を返す
          const scheduledMinutes = this.scheduledWorkingMinutes || 0

          // 所定労働時間を超えた分で、480分以内の残業時間を計算
          const overtimeMinutes = Math.min(
            Math.max(workingMinutes - scheduledMinutes, 0),
            480 - scheduledMinutes
          )

          return overtimeMinutes
        },
        set(v) {},
      },
      nonStatutoryOvertimeMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          // 日をまたぎ、かつ翌日が法定休日である場合は当日労働時間を取得
          const workingMinutes = this.isNextDayLegalHoliday
            ? this.currentDayWorkingMinutes || 0
            : this.totalWorkingMinutes || 0

          // 480分（8時間）を超えた分を計算
          const nonStatutoryMinutes = Math.max(workingMinutes - 480, 0)

          return nonStatutoryMinutes
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
   * 指定された勤務規則と日付範囲に基づいて、従業員の出勤記録を作成します。
   * 出勤データは指定された勤務規則のデフォルト出勤情報を使用して生成され、
   * Firestore のトランザクション内に保存されます。
   *
   * @param {Object} params - 入力パラメータ。
   * @param {string} params.from - 出勤記録の開始日（YYYY-MM-DD）。
   * @param {string} params.to - 出勤記録の終了日（YYYY-MM-DD）。
   * @throws {Error} トランザクションが失敗した場合、または必須パラメータが不足している場合はエラーが発生します。
   ****************************************************************************/
  static async createInRange({ from, to }) {
    try {
      /**
       * 期間内の DailyAttendance ドキュメントをすべて削除
       * - 一度作成された後に退職手続きがされるなど、不要な DailyAttendance ドキュメントが残ることを回避します。
       */
      await this.#deleteInRange({ from, to })

      await firestore.runTransaction(async (transaction) => {
        // 期間内に在職している従業員データを取得
        const paramsA = { hireDate: from, transaction }
        const employeeInstance = new Employee()
        const employees = await employeeInstance.getExistingEmployees(paramsA)

        // すべての従業員の雇用契約データを並行して取得し、フラット化
        const employeeContractInstance =
          new EmployeeContractForDailyAttendance()
        const employeeContracts = (
          await Promise.all(
            employees.map((employee) => {
              const employeeId = employee.docId
              const params = { employeeId, from, to, transaction }
              return employeeContractInstance.getEmployeeContracts(params)
            })
          )
        ).flat() // 2次元配列をフラット化

        // OperationWorkResult ドキュメントを取得
        const getOperationWorkResults = async ({ from, to }) => {
          const colRef = firestore.collection('OperationWorkResults')
          const queryRef = colRef
            .where('date', '>=', from)
            .where('date', '<=', to)
          const querySnapshot = await queryRef.get()
          return querySnapshot.docs.map((doc) => doc.data())
        }
        const operationWorkResults = await getOperationWorkResults({ from, to })

        for (const employee of employees) {
          const employeeId = employee.docId
          const fromDayjs = dayjs(from)
          const toDayjs = dayjs(to)
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
            })

            // ドキュメントを作成
            instance.create({ docId, transaction })
          }
        }
      })
    } catch (error) {
      logger.error('Transaction failed: ', error) // eslint-disable-line no-console
      throw new Error('Failed to create attendance records: ' + error.message)
    }
  }

  /**
   * 指定された期間内の DailyAttendance ドキュメントを削除します。
   *
   * このメソッドは、指定された `from` から `to` の日付範囲に基づいて、
   * Firestore 内の DailyAttendance ドキュメントをバッチ処理で削除します。
   * バッチ削除に失敗した場合はエラーがスローされます。
   *
   * @param {Object} param0 - 入力パラメータ。
   * @param {string} param0.from - 削除する範囲の開始日（YYYY-MM-DD）。
   * @param {string} param0.to - 削除する範囲の終了日（YYYY-MM-DD）。
   * @throws {Error} from および to のパラメータが不足している場合、またはバッチ削除が失敗した場合にエラーがスローされます。
   */
  static async #deleteInRange({ from = null, to = null } = {}) {
    // from と to が指定されていない場合、エラーをスロー
    if (!from || !to) {
      const message = `[deleteInRange] from と to が指定されていません。`
      logger.error(message, { from, to })
      throw new Error(message)
    }

    try {
      // クエリを作成
      const colRef = firestore.collection('DailyAttendances')
      const queryRef = colRef.where('date', '>=', from).where('date', '<=', to)
      const querySnapshot = await queryRef.get()

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
        { from, to }
      )
    } catch (err) {
      // エラーハンドリング
      const message = `[deleteInRange] DailyAttendance ドキュメントの削除中にエラーが発生しました。`
      logger.error(message, { from, to, err })
      throw new Error(message)
    }
  }
}
