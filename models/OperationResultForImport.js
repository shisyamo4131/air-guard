import OperationResult from './OperationResult'
import { classProps } from './propsDefinition/OperationResult'

/**
 * ## OperationResults インポート用データモデル
 *
 * OperationResult (稼働実績) ドキュメントをインポートするためだけに使用するクラスです。
 * - OperationResult クラスでは operationCount, unitPrice などのプロパティが他のプロパティから計算されるようになっており、
 *   CSV データを取り込むと、実際の値と異なる値で取り込まれてしまいます。
 * - 計算させるのではなく、元データをそのまま取り扱えるように、該当するプロパティを再定義しています。
 * - インポート専用のクラスであるため
 *   - useAutonumber を false にしています。
 *
 * NOTE:
 * - インポート時にも OperationResult クラスの create, update で OperationWorkResult を
 *   同期作成する必要があるために用意したクラスです。
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-18 - 初版作成
 */
export default class OperationResultForImport extends OperationResult {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static useAutonumber = false

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.delete
  }

  /****************************************************************************
   * INITIALIZE
   ****************************************************************************/
  initialize(item = {}) {
    super.initialize(item)
    this.operationCount = classProps.operationCount.default()
    this.unitPrice = classProps.unitPrice.default()
  }
}
