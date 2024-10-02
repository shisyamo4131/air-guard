import OperationResultDetail from './OperationResultDetail'

/**
 * ## OperationResultWorker（稼働実績明細）データモデル
 *
 * - `OperationResultDetail` を継承し、`employeeId` プロパティを追加しています。
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-10-02 - `OperationResultDetail` を継承するように変更
 */
export default class OperationResultWorker extends OperationResultDetail {
  /****************************************************************************
   * INITIALIZE
   ****************************************************************************/
  initialize(item = {}) {
    this.employeeId = item?.employeeId || ''
    super.initialize(item)
  }

  /****************************************************************************
   * クラスのプロパティをプレーンなオブジェクトとして返します。
   * @returns {Object} - クラスのプロパティを含むオブジェクト
   ****************************************************************************/
  toObject() {
    return { ...super.toObject(), employeeId: this.employeeId }
  }
}
