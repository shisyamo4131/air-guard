import { collection, doc, writeBatch } from 'firebase/firestore'
import { auth, firestore } from 'air-firebase'
import OperationResult from './OperationResult'
import OperationWorkResult from './OperationWorkResult'

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

  createAsBatch({ batchArray, batchIndex }) {
    let internalBatchIndex = batchIndex
    const docRef = doc(collection(firestore, 'OperationResults'))
    const createAt = new Date()
    const uid = auth.currentUser.uid

    // メインのOperationResultsドキュメントをセット
    batchArray[batchArray.length - 1].set(docRef, {
      ...this.toObject(),
      docId: docRef.id,
      createAt,
      uid,
    })

    internalBatchIndex++
    if (internalBatchIndex % 500 === 0) {
      batchArray.push(writeBatch(firestore))
    }

    // workersの分のOperationWorkResultsドキュメントをセット
    for (const worker of this.workers) {
      const docId = `${docRef.id}-${worker.employeeId}`
      const workerResultInstance = new OperationWorkResult({
        ...worker,
        docId,
        operationResultId: docRef.id,
        siteId: this.siteId,
        createAt,
        uid,
      })

      const workResultRef = doc(firestore, 'OperationWorkResults', docId)

      batchArray[batchArray.length - 1].set(workResultRef, {
        ...workerResultInstance.toObject(),
        createAt,
        uid,
      })

      internalBatchIndex++
      if (internalBatchIndex % 500 === 0) {
        batchArray.push(writeBatch(firestore))
      }
    }

    return internalBatchIndex
  }

  async updateAsBatch({ batchArray, batchIndex }) {
    let internalBatchIndex = batchIndex
    const updateAt = new Date()
    const uid = auth.currentUser.uid

    // 親ドキュメントを更新
    const docRef = doc(firestore, 'OperationResults', this.docId)
    this.updateAt = updateAt
    this.uid = uid
    batchArray[batchArray.length - 1].set(docRef, this.toObject(), {
      merge: true,
    })

    // 現在登録されている OperationWorkResults ドキュメントを取得
    const WorkResultInstance = new OperationWorkResult()
    const currentWorkers = await WorkResultInstance.fetchByOperationResultId(
      this.docId
    )

    // workers に存在しない従業員を削除対象として取得
    const deleteWorkers = currentWorkers.filter((currentWorker) => {
      return !this.workers.some(
        (worker) => worker.employeeId === currentWorker.employeeId
      )
    })

    // 削除対象の従業員のドキュメントをバッチ削除
    for (const deleteWorker of deleteWorkers) {
      const docRef = doc(firestore, 'OperationWorkResults', deleteWorker.docId)
      batchArray[batchArray.length - 1].delete(docRef)
      internalBatchIndex++

      if (internalBatchIndex % 500 === 0) {
        batchArray.push(writeBatch(firestore))
      }
    }

    // workers 配列に基づいてドキュメントを作成または更新
    for (const worker of this.workers) {
      const existWorker = currentWorkers.find(
        ({ employeeId }) => employeeId === worker.employeeId
      )
      const workResultInstance = new OperationWorkResult({
        ...existWorker,
        ...worker,
        operationResultId: this.docId, // 親ドキュメントのIDを関連付け
        siteId: this.siteId,
      })

      workResultInstance.uid = uid
      if (!existWorker) {
        workResultInstance.createAt = updateAt
      } else {
        workResultInstance.updateAt = updateAt
      }

      const docId = `${this.docId}-${worker.employeeId}`
      const docRef = doc(firestore, 'OperationWorkResults', docId)
      batchArray[batchArray.length - 1].set(
        docRef,
        workResultInstance.toObject(),
        { merge: true }
      )
      internalBatchIndex++

      if (internalBatchIndex % 500 === 0) {
        batchArray.push(writeBatch(firestore))
      }
    }

    return internalBatchIndex
  }
}
