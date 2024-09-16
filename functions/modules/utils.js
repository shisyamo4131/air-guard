/**
 * utils.js
 */

const { getFirestore } = require('firebase-admin/firestore')
const { info, error } = require('firebase-functions/logger')
const firestore = getFirestore()
const BATCH_LIMIT = 500

/**
 * Firestoreドキュメントの内容に変更があったかどうかを返します。
 * - updateAt、updateDate、uidを無視し、eventオブジェクトのbeforeとafterを比較します。
 *
 * @param {object} event - onDocumentUpdatedトリガーのイベントオブジェクト
 * @returns {boolean} - ドキュメントが変更されたかどうか
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-10 - 初版作成
 */
exports.isDocumentChanged = (event) => {
  // onDocumentUpdatedトリガーから発生したイベントかどうかをチェックします。
  const before = event?.data?.before?.data() || undefined
  const after = event?.data?.after?.data() || undefined
  if (!before || !after) {
    throw new Error('onDocumentUpdatedのeventオブジェクトが必要です。')
  }
  // updateAt、updateDate、uidフィールドを無視して比較します。
  const omitFields = (data) => {
    const { updateAt, updateDate, uid, ...fields } = data
    return fields
  }
  const beforeFields = omitFields(before)
  const afterFields = omitFields(after)

  return JSON.stringify(beforeFields) !== JSON.stringify(afterFields)
}

/**
 * 非正規化されたドキュメントデータを同期させます。
 *
 * この関数は、指定されたコレクション内のドキュメントを特定のフィールドで
 * 一致するデータと同期します。同期対象となるフィールドは指定されたデータで
 * 上書きされます。
 *
 * @param {string} collectionId - 同期対象のコレクションID
 * @param {string} field - 同期対象のフィールド名
 * @param {object} data - 同期するデータオブジェクト（例：{ docId: '123', ... }）
 * @returns {Promise<void>} - 同期操作が完了した時点で解決されるPromise
 *
 * @author shisyamo4131
 * @version 2.0.0
 *
 * #### 更新履歴
 * - version 2.0.0 - 2024-07-22 - [破壊]比較対象のプロパティ、更新対象のプロパティを引数で指定できるように修正。
 * - version 1.0.0 - 2024-07-10 - 初版作成
 */
exports.syncDependentDocuments = async (
  collectionId,
  compareProp,
  updateProp,
  data
) => {
  const BATCH_SIZE = 500
  info(`${collectionId}コレクション内のドキュメントと同期します。`)
  try {
    const colRef = firestore.collection(collectionId)
    const query = colRef.where(compareProp, '==', data.docId)
    const querySnapshot = await query.get()
    if (querySnapshot.empty) {
      info('同期対象のドキュメントはありませんでした。')
    } else {
      const docCount = querySnapshot.docs.length
      info(`${docCount}件のドキュメントと同期します。`)
      const batchArray = []
      querySnapshot.docs.forEach((doc, index) => {
        if (index % BATCH_SIZE === 0) batchArray.push(firestore.batch())
        batchArray[batchArray.length - 1].update(doc.ref, {
          [updateProp]: data,
        })
      })
      await Promise.all(batchArray.map((batch) => batch.commit()))
      info('同期処理が正常に完了しました。')
    }
  } catch (err) {
    error('syncDependentDocumentsでエラーが発生しました。詳細:', {
      message: err.message,
      stack: err.stack,
    })
    throw err
  }
}

/****************************************************************************
 * 指定されたコレクションのドキュメントを削除します。
 * - comparePropに基づき、docIdと一致するドキュメントを削除します。
 * - BATCH_LIMITごとにFirestoreのバッチ処理を行い、大量のドキュメントも効率的に削除します。
 *
 * @param {Array<string>} collectionIds - 削除対象のコレクションIDの配列
 * @param {string} compareProp - docIdと比較するプロパティの名前
 * @param {string} docId - 削除条件となるドキュメントID
 * @throws {Error} 削除処理中にエラーが発生した場合、エラーをスローします。
 ****************************************************************************/
exports.removeDependentDocuments = async (
  collectionIds,
  compareProp,
  docId
) => {
  for (const collectionId of collectionIds) {
    try {
      const colRef = firestore.collection(`${collectionId}`)
      const q = colRef.where(compareProp, '==', docId)
      const snapshots = await q.get()
      const batchArray = []

      // バッチ処理でドキュメントを削除
      snapshots.docs.forEach((doc, index) => {
        if (index % BATCH_LIMIT === 0) batchArray.push(firestore.batch())
        batchArray[batchArray.length - 1].delete(doc.ref)
      })

      // すべてのバッチをコミットして削除を実行
      await Promise.all(batchArray.map((batch) => batch.commit()))

      // 削除成功のログを出力
      info(
        `Documents in ${collectionId} deleted successfully for docId: ${docId}.`
      )
    } catch (err) {
      // エラーログを出力
      error(
        `Error deleting documents in ${collectionId} for docId: ${docId}.`,
        err
      )
      throw err // エラーを呼び出し元に再スロー
    }
  }
}
