import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import updateLocale from 'dayjs/plugin/updateLocale.js'
import FireModel from './FireModel.js'
import { classProps, accessor } from './propsDefinition/MonthlyAttendance.js'
import Employee from './Employee.js'
import { DailyAttendanceForMonthlyAttendance } from './DailyAttendance.js'
dayjs.extend(isSameOrBefore)
dayjs.extend(isoWeek)
dayjs.extend(updateLocale)
dayjs.updateLocale('en', { weekStart: 1 })
const firestore = getFirestore()
const BATCH_LIMIT = 500

/**
 * MonthlyAttendancesドキュメントデータモデル【物理削除】
 *
 * - 従業員の月ごと出勤簿に該当するドキュメントのデータモデルです。
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-09 - 初版作成
 */
export default class MonthlyAttendance extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'MonthlyAttendances'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    dailyAttendances: DailyAttendanceForMonthlyAttendance,
    dailyAttendancesPrev: DailyAttendanceForMonthlyAttendance,
    dailyAttendancesNext: DailyAttendanceForMonthlyAttendance,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.tokenMap
    Object.defineProperties(this, {
      totalWorkingDays: {
        configurable: true,
        enumerable: true,
        get() {
          return this.dailyAttendances.filter(
            ({ totalWorkingMinutes }) => totalWorkingMinutes > 0
          ).length
        },
        set(v) {},
      },
      totalWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          return this.dailyAttendances.reduce(
            (sum, i) => sum + i.totalWorkingMinutes,
            0
          )
        },
        set(v) {},
      },
      totalScheduledWorkDays: {
        configurable: true,
        enumerable: true,
        get() {
          return this.dailyAttendances.filter(
            ({ dayType }) => dayType === 'scheduled'
          ).length
        },
        set(v) {},
      },
      totalScheduledWorkingDays: {
        configurable: true,
        enumerable: true,
        get() {
          return this.dailyAttendances.filter(
            ({ dayType, totalWorkingMinutes }) =>
              dayType === 'scheduled' && totalWorkingMinutes > 0
          ).length
        },
        set(v) {},
      },
      totalNonScheduledWorkingDays: {
        configurable: true,
        enumerable: true,
        get() {
          return this.dailyAttendances.filter(
            ({ dayType, totalWorkingMinutes }) =>
              dayType === 'non-statutory-holiday' && totalWorkingMinutes > 0
          ).length
        },
        set(v) {},
      },
      holidayWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          return this.dailyAttendances.reduce(
            (sum, i) => sum + i.holidayWorkingMinutes,
            0
          )
        },
        set(v) {},
      },
      holidayWorkingDays: {
        configurable: true,
        enumerable: true,
        get() {
          return this.dailyAttendances.filter(
            ({ dayType, totalWorkingMinutes }) =>
              dayType === 'legal-holiday' && totalWorkingMinutes > 0
          ).length
        },
        set(v) {},
      },

      /**
       * 所定労働時間（分）
       */
      scheduledWorkMinutes: accessor.scheduledWorkMinutes,

      /**
       * 所定内労働時間（分）
       */
      scheduledWorkingMinutes: accessor.scheduledWorkingMinutes,

      statutoryOvertimeMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          return this.dailyAttendances.reduce(
            (sum, i) => sum + i.statutoryOvertimeMinutes,
            0
          )
        },
        set(v) {},
      },
      nonStatutoryOvertimeMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          return this.dailyAttendances.reduce(
            (sum, i) => sum + i.nonStatutoryOvertimeMinutes,
            0
          )
        },
        set(v) {},
      },
      nighttimeWorkingMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          return this.dailyAttendances.reduce(
            (sum, i) => sum + i.nonStatutoryOvertimeMinutes,
            0
          )
        },
        set(v) {},
      },
      absentDays: {
        configurable: true,
        enumerable: true,
        get() {
          return this.dailyAttendances.filter(
            ({ attendanceStatus }) => attendanceStatus === 'absent'
          ).length
        },
        set(v) {},
      },
      annualPaidLeaveDays: {
        configurable: true,
        enumerable: true,
        get() {
          return this.dailyAttendances.filter(
            ({ leaveRecord }) => leaveRecord?.isAnnualPaidLeave
          ).length
        },
        set(v) {},
      },
    })
  }

  /****************************************************************************
   * 指定された月の出勤簿（DailyAttendances）データを集計し、MonthlyAttendance
   * ドキュメントを作成します。
   * - 対象月の既存 MonthlyAttendance ドキュメントは削除されます。
   * - その後、指定された期間（該当月の 1 日〜月末）内の DailyAttendance ドキュメントを
   *   取得し、従業員ごとに新しい MonthlyAttendance ドキュメントを作成します。
   *
   * @param {Object} param0 - パラメータオブジェクト。
   * @param {string} param0.month - 集計対象の年月（YYYY-MM 形式）。
   * @param {string} [param0.employeeId] - フィルタリング対象の従業員ID（オプション）。
   * @throws {Error} - 引数の形式が正しくない場合や、バッチ処理でエラーが発生した場合。
   ****************************************************************************/
  static async createInRange({ month = null, employeeId = null } = {}) {
    // 引数のチェック
    if (!month) {
      const message = `[createInRange] month の指定（YYYY-MM形式）が必要です。`
      logger.error(message)
      throw new Error(`${message}`)
    }
    const regex = /^\d{4}-(0[1-9]|1[0-2])$/ // 正しい月の形式に修正
    if (typeof month !== 'string' || !regex.test(month)) {
      const message = `[createInRange] month は 'YYYY-MM' 形式の文字列である必要があります。`
      logger.error(message, { month })
      throw new Error(`${message} month: ${month}`)
    }

    try {
      // 既存の MonthlyAttendance ドキュメントを削除
      await this.#deleteInRange({ month, employeeId })

      // 期間開始日と終了日を取得
      const from = dayjs(`${month}-01`).format('YYYY-MM-DD')
      const to = dayjs(`${month}-01`).endOf('month').format('YYYY-MM-DD')

      let employees = []
      if (employeeId) {
        const employeeInstance = new Employee()
        const employee = await employeeInstance.fetchDoc(employeeId)
        employees.push(employee)
      } else {
        // 期間内に在職している従業員データを取得
        employees = await Employee.getExistingEmployees({ from, to })
      }

      // 処理対象の従業員が存在しなければログを出力して終了
      if (!employees.length) {
        logger.info(
          `[createInRange] MonthlyAttendance 作成対象の従業員が存在しませんでした。`,
          { month }
        )
        return
      }

      // 期間内の DailyAttendance ドキュメントを取得 -> 週単位で前月分・翌月分も必要
      const dailyAttendanceInstance = new DailyAttendanceForMonthlyAttendance()
      const start = dayjs(from).startOf('week').format('YYYY-MM-DD')
      const end = dayjs(to).endOf('week').format('YYYY-MM-DD')
      const getDailyAttendances = async (docId) => {
        const queryRef = firestore
          .collection('DailyAttendances')
          .where('employeeId', '==', docId)
          .where('date', '>=', start)
          .where('date', '<=', end)
          .withConverter(dailyAttendanceInstance.converter())
        const querySnapshot = await queryRef.get()
        return querySnapshot.docs.map((doc) => doc.data())
      }
      const dailyAttendancesAll = (
        await Promise.all(
          employees.map(({ docId }) => getDailyAttendances(docId))
        )
      ).flat()

      const batchArray = []
      let batchIndex = 0

      // 従業員ごとにトランザクションで MonthlyAttendance ドキュメントを作成
      for (const employee of employees) {
        if (batchIndex % BATCH_LIMIT === 0) batchArray.push(firestore.batch())
        const dailyAttendances = dailyAttendancesAll.filter(
          // (attendance) => attendance.employeeId === employeeId
          (attendance) => attendance.employeeId === employee.docId
        )

        // docId を固定
        const docId = `${employee.docId}-${month}`

        // MontylyAttendance インスタンスを用意
        const instance = new this({
          docId,
          employeeId: employee.docId,
          employeeCode: employee.code,
          month,
          startDate: from,
          endDate: to,
          dailyAttendances: dailyAttendances.filter(
            ({ date }) => date >= from && date <= to
          ),
          dailyAttendancesPrev: dailyAttendances.filter(
            ({ date }) => date < from
          ),
          dailyAttendancesNext: dailyAttendances.filter(
            ({ date }) => date > to
          ),
        })

        // ドキュメントを作成
        const docRef = firestore.collection('MonthlyAttendances').doc(docId)
        instance.createAt = new Date()
        batchArray[batchArray.length - 1].set(docRef, instance.toObject())
        batchIndex++
      }

      await Promise.all(batchArray.map((batch) => batch.commit()))
      // 処理完了ログを出力
      logger.info(
        `[createInRange] MonthlyAttendance ドキュメントの作成処理が完了しました。`,
        { month, employeeId }
      )
    } catch (error) {
      const message =
        '[createInRange] MonthlyAttendance ドキュメントの作成処理でエラーが発生しました。'
      logger.error(message, { month, employeeId, error })
      throw error
    }
  }

  /****************************************************************************
   * MonthlyAttendances ドキュメントのうち、引数 month で指定された年月のドキュメントを削除します。
   * - 削除はバッチで処理されます。
   * - このメソッドは createInRange からのみ呼び出されることを前提としています。
   * @param {Object} param0 - 入力パラメータ。
   * @param {string} param0.month - 'YYYY-MM' 形式の年月。
   * @throws {Error} 引数の形式が正しくない場合、または削除処理でエラーが発生した場合はエラーをスローします。
   ****************************************************************************/
  static async #deleteInRange({ month = null, employeeId = null } = {}) {
    // 引数のチェック
    const regex = /^\d{4}-(0[1-9]|1[0-2])$/ // 正しい月の形式に修正
    if (!month || typeof month !== 'string' || !regex.test(month)) {
      const message = `[deleteInRange] month は 'YYYY-MM' 形式の文字列である必要があります。`
      logger.error(message, { month })
      throw new Error(`${message} month: ${month}`)
    }
    try {
      const colRef = firestore.collection('MonthlyAttendances')
      let queryRef = colRef.where('month', '==', month)
      if (employeeId) queryRef = queryRef.where('employeeId', '==', employeeId)
      const querySnapshot = await queryRef.get()

      // ドキュメントが存在しない場合は処理を終了
      if (querySnapshot.empty) {
        logger.info(
          `[deleteInRange] 削除対象の MonthlyAttendances ドキュメントが見つかりませんでした。`,
          { month, employeeId }
        )
        return
      }

      // バッチ処理の準備
      const batchArray = []
      querySnapshot.docs.forEach((doc, index) => {
        if (index % BATCH_LIMIT === 0) batchArray.push(firestore.batch())
        batchArray[batchArray.length - 1].delete(doc.ref)
      })

      // バッチをすべてコミット
      await Promise.all(batchArray.map((batch) => batch.commit()))
    } catch (error) {
      const message = `[deleteInRange] MonthlyAttendances の月次削除処理でエラーが発生しました。`
      logger.error(message, { month, error })
      throw error
    }
  }
}
