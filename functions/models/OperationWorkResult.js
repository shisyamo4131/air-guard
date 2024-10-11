import { logger } from 'firebase-functions/v2'
import { getFirestore } from 'firebase-admin/firestore'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/OperationResultWorker.js'
import { classProps as addProps } from './propsDefinition/OperationWorkResult.js'
const firestore = getFirestore()

/**
 * ## OperationWorkResults
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-11 - 初版作成
 */
export default class OperationWorkResult extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'OperationWorkResults'
  static classProps = { ...classProps, ...addProps }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.create
    delete this.update
    delete this.delete
  }

  /****************************************************************************
   * 指定された従業員IDと日付範囲に基づいて、OperationWorkResults のデータを取得します。
   * - `from` と `to` は必須で、指定された日付範囲のデータを取得します。
   * - `employeeId` が指定されている場合、その従業員のデータのみをフィルタします。
   * - Firestoreのトランザクションが指定されている場合は、トランザクション内でクエリを実行します。
   *
   * @param {Object} options - クエリのオプションを指定します。
   * @param {string} options.from - 取得する期間の開始日（YYYY-MM-DD形式）。
   * @param {string} options.to - 取得する期間の終了日（YYYY-MM-DD形式）。
   * @param {string} [options.employeeId] - 取得する従業員のID（オプション）。
   * @param {Object} [options.transaction] - Firestoreのトランザクションオブジェクト（オプション）。
   * @returns {Promise<Array<Object>>} OperationWorkResults のドキュメントデータを配列で返します。
   * @throws {Error} 必須パラメータが不足している場合、またはクエリが失敗した場合にエラーが発生します。
   ****************************************************************************/
  static async getOperationWorkResults({
    from = null,
    to = null,
    employeeId = null,
    transaction = null,
  } = {}) {
    // from と to が指定されていない場合、エラーをスロー
    if (!from || !to) {
      const message = `[getOperationWorkResults] from と to が指定されていません。`
      logger.error(message, { from, to })
      throw new Error(message)
    }

    const instance = new this()
    const colRef = firestore.collection('OperationWorkResults')

    // 基本クエリの構築（from, to の範囲）
    let queryRef = colRef.where('date', '>=', from).where('date', '<=', to)

    // employeeId が指定されている場合、フィルタを追加
    if (employeeId) {
      queryRef = queryRef.where('employeeId', '==', employeeId)
    }

    // コンバータの適用
    queryRef = queryRef.withConverter(instance.converter())

    try {
      // トランザクション内での実行または通常のクエリ実行
      const querySnapshot = transaction
        ? await transaction.get(queryRef)
        : await queryRef.get()
      return querySnapshot.docs.map((doc) => doc.data())
    } catch (error) {
      // エラーハンドリング
      const message = `[getOperationWorkResults] 不明なエラーが発生しました。`
      logger.error(message, { from, to, employeeId, error })
      throw new Error(message)
    }
  }
}
