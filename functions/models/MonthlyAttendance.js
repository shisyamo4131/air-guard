import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/MonthlyAttendance.js'
dayjs.extend(isSameOrBefore)
dayjs.extend(isoWeek)
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
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.tokenMap
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
   * @throws {Error} - 引数の形式が正しくない場合や、トランザクション処理でエラーが発生した場合。
   ****************************************************************************/
  static async createInRange({ month }) {
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
      await this.#deleteInRange({ month })

      // 期間開始日と終了日を取得
      const startDate = dayjs(`${month}-01`).format('YYYY-MM-DD')
      const endDate = dayjs(`${month}-01`).endOf('month').format('YYYY-MM-DD')

      /**
       * 期間中に在籍していた従業員の docId のリストを取得
       * - 条件1) 処理時点で status が active であり、かつ hireDate が endDate 以前 -> 現在在職中で、期間終了日以前に雇い入れられた従業員
       * - 条件2) 処理時点で status が active ではないが、leaveDate が startDate 以降 -> 現在退職済みだが、退職日が期間開始日以降
       * 上記それぞれの条件で取得した docId を結合すると期間中に在籍していた従業員の docId のリストになる。
       */
      // 条件1)
      const activeEmployeesQueryRef = firestore
        .collection('Employees')
        .where('status', '==', 'active')
        .where('hireDate', '<=', endDate)
      const activeEmployeesQuerySnapshot = await activeEmployeesQueryRef.get()
      const activeEmployeesDocIds = activeEmployeesQuerySnapshot.docs.map(
        (doc) => doc.data().docId
      )

      // 条件2)
      const leaveEmployeesQueryRef = firestore
        .collection('Employees')
        .where('status', '!=', 'active')
        .where('leaveDate', '>=', startDate)
      const leaveEmployeesQuerySnapshot = await leaveEmployeesQueryRef.get()
      const leaveEmployeesDocIds = leaveEmployeesQuerySnapshot.docs.map(
        (doc) => doc.data().docId
      )

      // それぞれの docIds を結合
      const employeeIds = activeEmployeesDocIds.concat(leaveEmployeesDocIds)

      // 処理対象の従業員が存在しなければログを出力して終了
      if (!employeeIds.length) {
        logger.info(
          `[createInRange] MonthlyAttendance 作成対象の従業員が存在しませんでした。`,
          { month }
        )
        return
      }

      // 従業員ごとにトランザクションで MonthlyAttendance ドキュメントを作成
      for (const employeeId of employeeIds) {
        await firestore.runTransaction(async (transaction) => {
          // 期間内の DailyAttendance ドキュメントを取得
          const dailyRef = firestore
            .collection('DailyAttendances')
            .where('employeeId', '==', employeeId)
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
          const dailySnapshot = await transaction.get(dailyRef)
          const dailyDocs = dailySnapshot.docs.map((doc) => doc.data())

          // docId を固定
          const docId = `${employeeId}-${month}`

          // MontylyAttendance インスタンスを用意
          const instance = new this({
            docId,
            employeeId,
            month,
            startDate,
            endDate,
            dailyDocs,
          })

          // ドキュメントを作成
          instance.create({ docId, transaction })
        })
      }
    } catch (error) {
      const message =
        '[createInRange] MonthlyAttendance ドキュメントの作成処理でエラーが発生しました。'
      logger.error(message, { month, error })
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
  static async #deleteInRange({ month }) {
    // 引数のチェック
    const regex = /^\d{4}-(0[1-9]|1[0-2])$/ // 正しい月の形式に修正
    if (!month || typeof month !== 'string' || !regex.test(month)) {
      const message = `[deleteInRange] month は 'YYYY-MM' 形式の文字列である必要があります。`
      logger.error(message, { month })
      throw new Error(`${message} month: ${month}`)
    }
    try {
      const colRef = firestore.collection('MonthlyAttendances')
      const queryRef = colRef.where('month', '==', month)
      const querySnapshot = await queryRef.get()

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
