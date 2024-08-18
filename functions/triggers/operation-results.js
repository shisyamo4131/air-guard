const { error } = require('firebase-functions/logger')
const {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const { isDocumentChanged } = require('../modules/utils')
const OperationWorkResult = require('../models/OperationWorkResult')

/**
 * OperationResultsドキュメントが作成された時の処理。
 * - workers配列に基づいてOperationWorkResultsドキュメントを同期します。
 *
 * @param {Object} event - Firestoreトリガーによって提供されるイベントオブジェクト
 * @returns {Promise<void>} - 処理が完了するまでのPromise
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-08-16 - 初版作成
 */
exports.onCreated = onDocumentCreated(
  'OperationResults/{docId}',
  async (event) => {
    try {
      const workers = event.data.get('workers') || []
      await OperationWorkResult.sync(event.params.docId, [], workers)
    } catch (err) {
      error('Error creating OperationWorkResults:', {
        error: err.message,
        stack: err.stack,
        params: event.params,
      })
    }
  }
)

/**
 * `OperationResults`ドキュメントが更新された時の処理
 * - `workers`配列の更新に基づいて`OperationWorkResults`ドキュメントを同期します。
 *
 * @param {Object} event - Firestoreトリガーによって提供されるイベントオブジェクト
 * @returns {Promise<void>} - 処理が完了するまでのPromise
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-08-16 - 初版作成
 */
exports.onUpdated = onDocumentUpdated(
  'OperationResults/{docId}',
  async (event) => {
    try {
      // ドキュメントに変更がなければ処理をスキップ
      if (!isDocumentChanged(event)) return

      const beforeWorkers = event.data.before.get('workers') || []
      const afterWorkers = event.data.after.get('workers') || []
      await OperationWorkResult.sync(
        event.params.docId,
        beforeWorkers,
        afterWorkers
      )
    } catch (err) {
      error('Error updating OperationWorkerResults:', {
        error: err.message,
        stack: err.stack,
        params: event.params,
      })
    }
  }
)

/**
 * OperationResultsドキュメントが削除された時の処理
 * - 同期された`OperationWorkResults`ドキュメントを削除します。
 *
 * @param {Object} event - Firestoreトリガーによって提供されるイベントオブジェクト
 * @returns {Promise<void>} - 処理が完了するまでのPromise
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-08-16 - 初版作成
 */
exports.onDeleted = onDocumentDeleted(
  'OperationResults/{docId}',
  async (event) => {
    try {
      const workers = event.data.get('workers') || []
      await OperationWorkResult.sync(event.params.docId, workers, [])
    } catch (err) {
      error('Error deleting OperationWorkerResults:', {
        error: err.message,
        stack: err.stack,
        params: event.params,
      })
    }
  }
)
