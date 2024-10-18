import { collection, doc, writeBatch } from 'firebase/firestore'
import { auth, firestore } from 'air-firebase'
import OperationResult from './OperationResult'
import OperationWorkResult from './OperationWorkResult'

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
    super.initialize(item)
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
