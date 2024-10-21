import OperationResult from './OperationResult'

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
    delete this.operationCount
    delete this.unitPrice
    // operationCount を再定義
    this.operationCount = {
      standard: {
        normal: item?.operationCount?.starndard?.normal ?? 0,
        half: item?.operationCount?.starndard?.half ?? 0,
        cancel: item?.operationCount?.starndard?.cancel ?? 0,
        total: item?.operationCount?.starndard?.total ?? 0,
        overtimeMinutes: item?.operationCount?.starndard?.overtimeMinutes ?? 0,
      },
      qualified: {
        normal: item?.operationCount?.qualified?.normal ?? 0,
        half: item?.operationCount?.qualified?.half ?? 0,
        cancel: item?.operationCount?.qualified?.cancel ?? 0,
        total: item?.operationCount?.qualified?.total ?? 0,
        overtimeMinutes: item?.operationCount?.qualified?.overtimeMinutes ?? 0,
      },
      total: item?.operationCount?.total ?? 0,
      overtimeMinutes: item?.operationCount?.overtimeMinutes ?? 0,
    }

    // unitPrice を再定義
    this.unitPrice = {
      standard: {
        normal: item?.unitPrice?.starndard?.normal ?? null,
        half: item?.unitPrice?.starndard?.half ?? null,
        cancel: item?.unitPrice?.starndard?.cancel ?? null,
        overtime: item?.unitPrice?.starndard?.overtime ?? null,
      },
      qualified: {
        normal: item?.unitPrice?.qualified?.normal ?? null,
        half: item?.unitPrice?.qualified?.half ?? null,
        cancel: item?.unitPrice?.qualified?.cancel ?? null,
        overtime: item?.unitPrice?.qualified?.overtime ?? null,
      },
    }
  }
}
