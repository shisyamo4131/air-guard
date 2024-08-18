const FireModelV2 = require('./FireModelV2')
const OperationResultWorker = require('./OperationResultWorker')

/**
 * ## OperationResult
 *
 * Cloud FunctionsでOperationResultドキュメントを操作する際のドキュメントモデルです。
 * このクラスは、`FireModelV2` を継承し、OperationResult固有のフィールドを持ちます。
 * また、関連する従業員データ（`OperationResultWorker`）を含みます。
 *
 * @extends FireModelV2
 * @property {string} code - OperationResultに関連するコード
 * @property {string} siteId - 現場の一意の識別子
 * @property {Object} site - 現場に関する詳細情報
 * @property {string} date - 操作が行われた日付 (フォーマット: "YYYY-MM-DD")
 * @property {string} dayDiv - 曜日区分 ("weekday", "saturday", "sunday", "holiday")
 * @property {string} workShift - シフト区分 ("day", "night")
 * @property {string} deadline - 締切日時 (フォーマット: "YYYY-MM-DDTHH:mm:ssZ")
 * @property {Array<OperationResultWorker>} workers - OperationResultに関連する従業員の配列
 * @property {string} remarks - 備考
 *
 * @method toObject - クラスのインスタンスを通常のJavaScriptオブジェクトに変換します。
 *
 * @example
 * const operationResult = new OperationResult({
 *   docId: 'abc123',
 *   code: '2023-001',
 *   siteId: 'site-001',
 *   date: '2024-08-16',
 *   workers: [
 *     new OperationResultWorker({
 *       employeeId: '12345',
 *       startTime: '09:00',
 *       endTime: '17:00',
 *     }),
 *   ],
 * });
 * const docRef = firestore
 *   .collection('OperationResults')
 *   .withConverter(operationResult.firestoreConverter())
 *   .doc(operationResult.docId);
 * await docRef.set(operationResult);
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 初版作成
 */
class OperationResult extends FireModelV2 {
  /**
   * コンストラクタ
   * @param {Object} item - OperationResultデータを含むオブジェクト
   */
  constructor(item = {}) {
    super(item, 'OperationResults') // FireModelV2のコンストラクタを呼び出し、コレクションパスを指定
    this.code = item?.code || ''
    this.siteId = item?.siteId || ''
    this.site = item?.site || {}
    this.date = item?.date || ''
    this.dayDiv = item?.dayDiv || 'weekday'
    this.workShift = item?.workShift || 'day'
    this.deadline = item?.deadline || ''
    this.workers = (item?.workers || []).map(
      (worker) => new OperationResultWorker(worker)
    )
    this.remarks = item?.remarks || ''
  }

  /**
   * クラスのインスタンスを通常のJavaScriptオブジェクトに変換します。
   * @returns {Object} - 変換されたオブジェクト
   */
  toObject() {
    return {
      ...super.toObject(),
      workers: this.workers.map((worker) => worker.toObject()),
    }
  }
}

module.exports = OperationResult
