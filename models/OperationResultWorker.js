import OperationResultDetail from './OperationResultDetail'

/**
 * ## OperationResultWorker（稼働実績明細）データモデル
 *
 * - `OperationResultDetail` を継承し、`employeeId` プロパティを追加しています。
 * - `OperationResultOutsourcer` データとともに DataTable で利用できるように
 *   `employeeId` をそのまま複製した `id` プロパティを実装しています。
 * - 自身が従業員の稼働実績であることを表すため、`isEmployee` プロパティは true、`isOutsourcer` プロパティは false に固定されます。
 *
 * NOTE:
 * - OperationResultDetail は FireModel を継承したクラスではないため、
 *   toObject は自前で調整する必要があります。
 *
 * @version 2.1.1
 * @author shisyamo4131
 * @updates
 * - version 2.1.1 - 2024-10-18 - toObject プロパティの不具合を修正
 * - version 2.1.0 - 2024-10-03 - `id` プロパティを追加。
 *                              - `isEmployee`、`isOutsourcer` プロパティを追加。
 * - version 2.0.0 - 2024-10-02 - `OperationResultDetail` を継承するように変更
 */
export default class OperationResultWorker extends OperationResultDetail {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    this.isEmployee = true
    this.isOutsourcer = false
    Object.defineProperties(this, {
      id: {
        configurable: true,
        enumerable: true,
        get() {
          return `${this.employeeId}`
        },
        set(v) {},
      },
    })
  }

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
    return {
      ...super.toObject(),
      employeeId: this.employeeId,
      isEmployee: this.isEmployee,
      isOutsourcer: this.isOutsourcer,
      id: this.id,
    }
  }
}
