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
import { onDocumentDeleted } from 'firebase-functions/v2/firestore'
import { info, error } from 'firebase-functions/logger'
import { getFirestore } from 'firebase-admin/firestore'
const firestore = getFirestore()

/****************************************************************************
 * `OperationResults`ドキュメントの削除トリガーです。
 * - 従属する`OperationWorkResults`ドキュメントを削除します。
 *
 * @author shisyamo4131
 * @version 1.1.0
 * @updates
 * - version 1.1.0 - 2024-09-25 - `OperationWorkResults` ドキュメントの削除処理を切り出し
 * - version 1.0.0 - 2024-09-20 - 初版作成
 ****************************************************************************/
export const onDelete = onDocumentDeleted(
  'OperationResults/{docId}',
  async (event) => {
    const docId = event.params.docId
    info(
      `[operationResults.onDelete] OperationResults document deleted. docId: ${docId}`
    )
    try {
      await deleteOperationWorkResults(docId)
    } catch (err) {
      error(
        `[operationResults.onDelete] Error deleting related OperationWorkResults for docId: ${docId}`,
        err
      )
    }
  }
)

/****************************************************************************
 * 引数 `operationResultId` に該当する `OperationWorkResults` ドキュメントをすべて削除します。
 * - 従属する`OperationWorkResults`ドキュメントを削除します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-25 - 初版作成
 ****************************************************************************/
const deleteOperationWorkResults = async (operationResultId) => {
  try {
    const colRef = firestore.collection('OperationWorkResults')
    const query = colRef.where('operationResultId', '==', operationResultId)
    const querySnapshot = await query.get()

    const promises = []
    querySnapshot.forEach((snapshot) => {
      promises.push(snapshot.ref.delete()) // 非同期削除を配列に格納
    })
    await Promise.all(promises) // すべての削除が完了するまで待機
    info(
      `Related OperationWorkResults documents deleted for docId: ${operationResultId}`
    )
  } catch (err) {
    error(
      `Error deleting related OperationWorkResults for docId: ${operationResultId}`,
      err
    )
  }
}
