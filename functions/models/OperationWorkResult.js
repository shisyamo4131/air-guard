const firestore = require('firebase-admin/firestore').getFirestore()
const FireModelV2 = require('./FireModelV2')
const { sharedProperties } = require('./SharedWorkResult')
const BATCH_LIMIT = 500

/**
 * ## OperationWorkResult
 *
 * Cloud FunctionsでOperationWorkResultsドキュメントを操作する際のドキュメントモデルです。
 * このクラスは、`FireModelV2` を継承し、OperationWorkResult固有のフィールドを持ちます。
 *
 * @extends FireModelV2
 * @property {string} operationResultId - OperationResultドキュメントの一意の識別子
 * @property {Object} transportationCost - 交通費に関する情報
 *
 * @method toObject - クラスのインスタンスを通常のJavaScriptオブジェクトに変換します。
 * @method sync - ドキュメントの同期処理をまとめて行います。
 *
 * @example
 * const workResult = new OperationWorkResult({
 *   operationResultId: 'result-123',
 *   employeeId: 'employee-456',
 *   startTime: '09:00',
 *   endTime: '18:00',
 * });
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-08-16 - 初版作成
 */
class OperationWorkResult extends FireModelV2 {
  constructor(item = {}) {
    super(item, 'OperationWorkResults')

    Object.assign(this, sharedProperties, item)

    this.operationResultId = item?.operationResultId || ''

    this.transportationCost = item?.transportationCost || {
      type: 'on-cash',
      amount: 0,
      status: '0:creating',
      createAt: this.dateJst().getTime(),
      draftAt: null,
      pendingAt: null,
      approvedAt: null,
      settledAt: null,
      rejectedAt: null,
      rejectReason: '',
      updateAt: this.dateJst().getTime(),
    }
  }

  /**
   * `FireModelV2` の `create` メソッドをオーバーライドします。
   * `docId` を `operationReusltId` と `employeeId` の組み合わせに固定します。
   * @returns {Promise<void>} - 処理が完了するまでのPromise
   */
  async create() {
    const docId = `${this.operationResultId}-${this.employeeId}`
    await super.create(docId)
  }

  /**
   * @private
   * `workers`配列をもとに`OperationWorkResults`ドキュメントを同期します。
   *
   * @param {string} operationResultId - OperationResultドキュメントのID
   * @param {Array<Object>} workers - 同期対象の従業員データ配列
   * @returns {Promise<void>} - 同期が完了するまでのPromise
   */
  static async #syncDocuments(operationResultId, workers) {
    const colRef = firestore.collection('OperationWorkResults')
    const snapshots = await colRef
      .where('operationResultId', '==', operationResultId)
      .get()
    const existingDocumentsMap = new Map(
      snapshots.docs.map((doc) => [doc.id, doc.data()])
    )

    const promises = workers.map((worker) => {
      const docId = `${operationResultId}-${worker.employeeId}`
      const workResult = new OperationWorkResult({
        ...worker,
        operationResultId,
      })
      const existingDocData = existingDocumentsMap.get(docId)
      if (existingDocData) {
        workResult.transportationCost = existingDocData.transportationCost
        return workResult.update()
      } else {
        return workResult.create()
      }
    })
    await Promise.all(promises)
  }

  /**
   * @private
   * `workers` 配列をもとに `OperationWorkResults` ドキュメントを削除します。
   *
   * @param {string} operationResultId - OperationResultドキュメントのID
   * @param {Array<Object>} workers - 削除対象の従業員データ配列
   * @returns {Promise<void>} - 削除が完了するまでのPromise
   */
  static async #deleteDocuments(operationResultId, workers) {
    const colRef = firestore.collection('OperationWorkResults')
    const batchArray = []

    workers.forEach((worker, index) => {
      if (index % BATCH_LIMIT === 0) batchArray.push(firestore.batch())
      const docId = `${operationResultId}-${worker.employeeId}`
      const docRef = colRef.doc(docId)

      const currentBatch = batchArray[batchArray.length - 1]
      currentBatch.delete(docRef)
    })

    await Promise.all(batchArray.map((batch) => batch.commit()))
  }

  /**
   * `OperationResults`ドキュメントの`workers`をもとに`OperationWorkResults`ドキュメントを同期します。
   * - `OperationResults`ドキュメントの各種トリガー内で呼び出されることを想定しています。
   * - `afterWorkers`は無条件に`OperationWorkResults`ドキュメントに同期されます。
   * - `beforeWorkers`に存在し、`afterWorkers`に存在しないものは`OperationWorkResults`ドキュメントが削除されます。
   *
   * @param {string} operationResultId - OperationResultドキュメントのID
   * @param {Array<Object>} beforeWorkers - 更新前の従業員データ配列
   * @param {Array<Object>} afterWorkers - 更新後の従業員データ配列
   * @returns {Promise<void>} - 同期が完了するまでのPromise
   */
  static async sync(operationResultId, beforeWorkers, afterWorkers) {
    // `deforeWorkers`に存在し、`afterWorkers`に存在しないものを抽出
    const deletedWorkers = beforeWorkers.filter((before) => {
      return !afterWorkers.some(
        (after) => after.employeeId === before.employeeId
      )
    })
    await Promise.all([
      this.#syncDocuments(operationResultId, afterWorkers),
      this.#deleteDocuments(operationResultId, deletedWorkers),
    ])
  }
}

module.exports = OperationWorkResult
