import OperationResult from './OperationResult'

/**
 * ## OperationResults インポート用データモデル
 *
 * OperationResult (稼働実績) ドキュメントをインポートするためだけに使用するクラスです。
 * - OperationResult クラスでは sales などのプロパティが他のプロパティから計算されるようになっており、
 *   元のデータと値が異なってしまいます。
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

    // operationCount を再定義
    delete this.operationCount
    this.operationCount = {
      standard: {
        normal: 0,
        half: 0,
        cancel: 0,
        total: 0,
        overtimeMinutes: 0,
      },
      qualified: {
        normal: 0,
        half: 0,
        cancel: 0,
        total: 0,
        overtimeMinutes: 0,
      },
      total: 0,
      overtimeMinutes: 0,
    }

    // unitPrice を再定義
    delete this.unitPrice
    this.unitPrice = {
      standard: {
        normal: null,
        half: null,
        cancel: null,
        overtime: null,
      },
      qualified: {
        normal: null,
        half: null,
        cancel: null,
        overtime: null,
      },
    }
  }
}
