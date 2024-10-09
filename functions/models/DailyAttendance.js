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
