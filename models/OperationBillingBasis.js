import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/OperationResult'
import Site from './Site'
import OperationResultWorker from './OperationResultWorker'
import SiteContract from './SiteContract'
import OperationResultOutsourcer from './OperationResultOutsourcer'
/**
 * ## OperationBillingBasis データモデル【物理削除】
 *
 * 稼働実績のデータモデルを請求業務の視点で管理するための特殊なモデルです。
 *
 * - ドキュメントは `OperationResults` を使用します。
 * - Create、Deleteはできません。
 * ‐ `OperationResult` クラスでは `OperationWorkResults` ドキュメントを同期させるために `update` メソッドをオーバーライドして独自の処理を実装していますが、
 *   `OperationBillingBasis` クラスでは `OperationWorkResults` ドキュメントに影響する更新は行わない（行わせない）ため、
 *   オーバーライドしていません。
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-02 - 初版作成
 */
export default class OperationBillingBasis extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'OperationResults'
  static useAutonumber = true
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    site: Site,
    siteContract: SiteContract,
    workers: OperationResultWorker,
    outsourcers: OperationResultOutsourcer,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    // createメソッド、deleteメソッドは使用不可
    delete this.create
    delete this.delete
    Object.defineProperties(this, {
      sales: {
        configurable: true,
        enumerable: true,
        get() {
          const result = {
            standard: {
              normal: 0,
              half: 0,
              cancel: 0,
              total: 0,
              overtime: 0,
            },
            qualified: {
              normal: 0,
              half: 0,
              cancel: 0,
              total: 0,
              overtime: 0,
            },
            total: 0,
          }

          // unitPriceとoperationCountの存在をチェック
          if (!this.unitPrice || !this.operationCount) return result

          // スタンダード料金の計算
          result.standard.normal =
            (this.operationCount.standard?.normal || 0) *
            (this.unitPrice.standard?.price || 0)
          result.standard.half =
            ((this.operationCount.standard?.half || 0) *
              (this.unitPrice.standard?.price || 0) *
              (this.unitPrice.halfRate || 0)) /
            100
          result.standard.cancel =
            ((this.operationCount.standard?.cancel || 0) *
              (this.unitPrice.standard?.price || 0) *
              (this.unitPrice.cancelRate || 0)) /
            100
          result.standard.overtime =
            ((this.operationCount.standard?.overtimeMinutes || 0) / 60) *
            (this.unitPrice.standard?.overtime || 0)

          // 有資格者料金の計算
          result.qualified.normal =
            (this.operationCount.qualified?.normal || 0) *
            (this.unitPrice.qualified?.price || 0)
          result.qualified.half =
            ((this.operationCount.qualified?.half || 0) *
              (this.unitPrice.qualified?.price || 0) *
              (this.unitPrice.halfRate || 0)) /
            100
          result.qualified.cancel =
            ((this.operationCount.qualified?.cancel || 0) *
              (this.unitPrice.qualified?.price || 0) *
              (this.unitPrice.cancelRate || 0)) /
            100
          result.qualified.overtime =
            ((this.operationCount.qualified?.overtimeMinutes || 0) / 60) *
            (this.unitPrice.qualified?.overtime || 0)

          // 合計を計算
          result.standard.total =
            result.standard.normal +
            result.standard.half +
            result.standard.cancel +
            result.standard.overtime
          result.qualified.total =
            result.qualified.normal +
            result.qualified.half +
            result.qualified.cancel +
            result.qualified.overtime

          result.total = result.standard.total + result.qualified.total

          return result
        },
        set(v) {},
      },
    })
  }
}
