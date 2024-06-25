/**
 * utils.js
 *
 * このファイルは、Firestoreのドキュメントデータの非正規化同期および変更検出を行うユーティリティ関数を提供します。
 *
 * 提供される関数:
 * 1. isDocumentChanged(event) - Firestoreドキュメントの内容に変更があったかどうかを判定します。
 * 2. syncDocuments(collectionId, field, data) - 非正規化されたドキュメントデータを指定のフィールドで同期します。
 *
 * 使用例:
 *
 * isDocumentChanged(event)
 * - 引数としてonDocumentUpdatedトリガーのイベントオブジェクトを受け取り、ドキュメントの内容が変更されたかどうかを返します。
 * - 変更検出時には、ドキュメントに含まれるupdateAt、updateDate、uidは無視されます。
 *
 * syncDocuments(collectionId, field, data)
 * - 引数としてコレクションID、フィールド名、同期するデータオブジェクトを受け取り、指定されたフィールドでドキュメントを同期します。
 *
 * @module utils
 * @version 1.0.0
 * @date 2024-06-21
 * @author shisyamo4131
 *
 * 更新履歴:
 * 2024-06-21 - 初版作成
 */

const { getFirestore } = require('firebase-admin/firestore')
const { info, error } = require('firebase-functions/logger')
const firestore = getFirestore()

/**
 * Firestoreドキュメントの内容に変更があったかどうかを返します。
 * updateAt、updateDate、uidを無視し、eventオブジェクトのbeforeとafterを比較します。
 *
 * @param {object} event - onDocumentUpdatedトリガーのイベントオブジェクト
 * @returns {boolean} - ドキュメントが変更されたかどうか
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
 */
exports.syncDocuments = async (collectionId, field, data) => {
  const BATCH_SIZE = 500
  info(`${collectionId}コレクション内のドキュメントと同期します。`)
  try {
    const colRef = firestore.collection(collectionId)
    const query = colRef.where(`${field}.docId`, '==', data.docId)
    const querySnapshot = await query.get()
    if (querySnapshot.empty) {
      info('同期対象のドキュメントはありませんでした。')
    } else {
      const docCount = querySnapshot.docs.length
      info(`${docCount}件のドキュメントと同期します。`)
      const batchArray = []
      querySnapshot.docs.forEach((doc, index) => {
        if (index % BATCH_SIZE === 0) batchArray.push(firestore.batch())
        batchArray[batchArray.length - 1].update(doc.ref, { [field]: data })
      })
      await Promise.all(batchArray.map((batch) => batch.commit()))
      info('同期処理が正常に完了しました。')
    }
  } catch (err) {
    error('syncDocumentsでエラーが発生しました。詳細:', {
      message: err.message,
      stack: err.stack,
    })
    throw err
  }
}
