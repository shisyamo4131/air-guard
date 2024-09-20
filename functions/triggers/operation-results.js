/**
 * ## operation-results.js
 *
 * `OperationResults`ドキュメントのトリガーに関する処理です。
 *
 * - アプリ側で`OperationWorkResults`ドキュメントが同期的に作成・更新・削除されていますが、
 *   EmulatorのUIなど、アプリ外で削除された場合に備えて、削除トリガーで対応する`OperationWorkResults`ドキュメントを削除します。
 *   -> `OperationWorkResults`ドキュメントはClientアプリから従業員が更新するもので、同期削除しないと不具合が発生します。
 * - 作成・更新時の同期処理はすべてアプリ側で行います。
 *   -> そもそもアプリ外で`OperationResults`ドキュメントが作成・更新されてはなりません。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-20 - 初版作成
 */
const { onDocumentDeleted } = require('firebase-functions/v2/firestore')
const { info, error } = require('firebase-functions/logger')
const { getFirestore } = require('firebase-admin/firestore')
const firestore = getFirestore()

/****************************************************************************
 * `OperationResults`ドキュメントの削除トリガーです。
 * - 従属する`OperationWorkResults`ドキュメントを削除します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-20 - 初版作成
 ****************************************************************************/
exports.onDelete = onDocumentDeleted(
  'OperationResults/{docId}',
  async (event) => {
    const docId = event.params.docId
    info(`[onDelete] OperationResults document deleted. docId: ${docId}`)
    try {
      const colRef = firestore.collection('OperationWorkResults')
      const query = colRef.where('operationResultId', '==', docId)
      const querySnapshot = await query.get()

      const promises = []
      querySnapshot.forEach((snapshot) => {
        promises.push(snapshot.ref.delete()) // 非同期削除を配列に格納
      })
      await Promise.all(promises) // すべての削除が完了するまで待機
      info(
        `[onDelete] Related OperationWorkResults documents deleted for docId: ${docId}`
      )
    } catch (err) {
      error(
        `[onDelete] Error deleting related OperationWorkResults for docId: ${docId}`,
        err
      )
    }
  }
)
