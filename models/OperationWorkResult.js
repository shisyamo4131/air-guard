import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/OperationResultWorker'
import { classProps as addProps } from './propsDefinition/OperationWorkResult'
/**
 * ## OperationWorkResults ドキュメントデータモデル【物理削除】
 *
 * 稼働実績明細から作成される交通費申請のデータモデルです。
 *
 * - OperationResultsドキュメントと同期して生成されるドキュメントです。
 * - 交通費申請に関わるデータの更新処理を行う為、独自のメソッドの中でsuper.update()をコールしています。
 * - 保有するプロパティはOperationResultWorkerを継承しつつ、交通費申請に必要なプロパティが追加されています。
 *
 * @version 2.1.0
 * @author shisyamo4131
 * @updates
 * - version 2.1.0 - 2024-10-11 - 追加プロパティを別ファイルで定義
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class OperationWorkResult extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'OperationWorkResults'
  static classProps = { ...classProps, ...addProps }

  /****************************************************************************
   * ADDED PROPERTIES
   ****************************************************************************/
  get workHours() {
    return this.workMinutes / 60
  }

  get breakHours() {
    return this.breakMinutes / 60
  }

  get overtimeHours() {
    return this.overtimeMinutes / 60
  }

  get nighttimeHours() {
    return this.nighttimeMinutes / 60
  }

  /****************************************************************************
   * FireModelのcreateメソッドをオーバーライドします。
   * - `docId`を`${operationResultId}-${employeeId}`に固定します。
   * - operationResultId と employeeId が必須で、指定されていない場合はエラーをスローします。
   * @param {string|null} [docId=null] - 作成するドキュメントのID（省略可能だが固定されます）
   * @param {boolean} [useAutonumber=false] - 自動採番を行うかどうか（デフォルト: false）
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   * @throws {Error} operationResultIdまたはemployeeIdが指定されていない場合、または作成時にエラーが発生した場合にエラーをスローします
   ****************************************************************************/
  async create({ transaction = null } = {}, callBack = null) {
    // operationResultId と employeeId が必須であることを確認
    if (!this.operationResultId) {
      throw new Error(`[create] operationResultId is required.`)
    }
    if (!this.employeeId) {
      throw new Error(`[create] employeeId is required.`)
    }

    // docIdを`${operationResultId}-${employeeId}`に固定
    const docId = `${this.operationResultId}-${this.employeeId}`

    try {
      // 親クラスのcreateメソッドを呼び出し
      return await super.create({ docId, transaction }, callBack)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[create] An error has occurred: ${err.message}`, { err })
      throw err
    }
  }

  /****************************************************************************
   * 指定されたoperationResultIdに基づいて`OperationWorkResults`ドキュメントを取得します。
   * - `operationResultId`と一致するドキュメントをFirestoreから取得します。
   *
   * @param {string} operationResultId - 取得対象のoperationResultId
   * @returns {Promise<Array>} 一致するドキュメントの配列を返すPromise
   * @throws {Error} ドキュメント取得中にエラーが発生した場合にエラーをスローします
   ****************************************************************************/
  async fetchByOperationResultId(operationResultId) {
    try {
      // operationResultIdに一致するドキュメントをFirestoreから取得
      return await this.fetchDocs([
        ['where', 'operationResultId', '==', operationResultId],
      ])
    } catch (err) {
      // エラーハンドリング：エラーメッセージを出力し、エラーを再スロー
      // eslint-disable-next-line no-console
      console.error(
        `[fetchByOperationResultId] Failed to fetch documents: ${err.message}`,
        { err }
      )

      // エラーを再スローして呼び出し元に通知
      throw err
    }
  }

  /****************************************************************************
   * 交通費の申請状態を`1:draft`（申請受付中）に更新します。
   ****************************************************************************/
  async toDraft() {
    this.transportationCost.status = '1:draft'
    this.transportationCost.draftAt = new Date()
    this.transportationCost.updateAt = new Date()
    await super.update()
  }

  /****************************************************************************
   * 交通費の申請状態を`2:pending`（申請中）に更新します。
   ****************************************************************************/
  async toPending() {
    this.transportationCost.status = '2:pending'
    this.transportationCost.pendingAt = new Date()
    this.transportationCost.updateAt = new Date()
    await super.update()
  }
}
