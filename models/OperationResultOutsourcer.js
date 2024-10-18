import OperationResultDetail from './OperationResultDetail'

/**
 * ## OperationResultOutsourcer（稼働実績明細）データモデル
 *
 * - `OperationResultDetail` を継承し、`outsourcerId` プロパティを追加しています。
 * - `OperationResult.outsourcers` に同一外注先が複数登録される可能性があるため、枝番として `branch` を追加しています。
 * - `id` プロパティで `outsourcerId` と `branch` の組み合わせを表現しています。
 * - 自身が外注先の稼働実績であることを表すため、`isEmployee` プロパティは false、`isOutsourcer` プロパティは true に固定されます。
 *
 * NOTE:
 * - OperationResultDetail は FireModel を継承したクラスではないため、
 *   toObject は自前で調整する必要があります。
 *
 * @version 2.1.1
 * @author shisyamo4131
 * @updates
 * - version 2.1.1 - 2024-10-18 - toObject プロパティの不具合を修正
 * - version 2.1.0 - 2024-10-03 - `isEmployee`、`isOutsourcer` プロパティを追加。
 * - version 2.0.0 - 2024-10-02 - 初版作成
 */
export default class OperationResultOutsourcer extends OperationResultDetail {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    this.isEmployee = false
    this.isOutsourcer = true
    Object.defineProperties(this, {
      id: {
        configurable: true,
        enumerable: true,
        get() {
          return `${this.outsourcerId}-${this.branch}`
        },
        set(v) {},
      },
    })
  }

  /****************************************************************************
   * INITIALIZE
   ****************************************************************************/
  initialize(item = {}) {
    this.outsourcerId = item?.outsourcerId || ''
    this.branch = item?.branch === 0 || item?.branch ? item.branch : null
    super.initialize(item)
  }

  /****************************************************************************
   * クラスのプロパティをプレーンなオブジェクトとして返します。
   * @returns {Object} - クラスのプロパティを含むオブジェクト
   ****************************************************************************/
  toObject() {
    return {
      ...super.toObject(),
      outsourcerId: this.outsourcerId,
      branch: this.branch,
      isEmployee: this.isEmployee,
      isOutsourcer: this.isOutsourcer,
      id: this.id,
    }
  }
}
