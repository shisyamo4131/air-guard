const { getFirestore } = require('firebase-admin/firestore')
const firestore = getFirestore()

/**
 * Firestoreドキュメントの内容に変更があったかどうかを返します。
 * updateAt、updateDate、uidを無視し、eventオブジェクトのbeforeとafterを比較します。
 * targetFieldsが指定されていた場合は、指定されたフィールドのみ検証します。
 * @param {object} event onDocumentUpdatedトリガーのイベントオブジェクト
 * @param {array} targetFields 変更を確認する対象フィールド
 * @returns Returns the document was changed or not.
 */
exports.isDocumentChanged = (event, targetFields = undefined) => {
  /* Check the event is emitted from onDocumentUpdated trigger or not. */
  const before = event?.data?.before?.data() || undefined
  const after = event?.data?.after?.data() || undefined
  if (!before || !after)
    throw new Error('onDocumentUpdatedのeventオブジェクトが必要です。')
  /* Ignore updateAt, updateDate and uid fields. */
  const { updateAt, updateDate, uid, ...fields } = after
  return Object.keys(fields)
    .filter((field) => {
      return !targetFields || targetFields.includes(field)
    })
    .some((field) => {
      return JSON.stringify(before[field]) !== JSON.stringify(after[field])
    })
}

/**
 * 非正規化されたドキュメントデータを同期させます。
 * @param {*} collectionId
 * @param {*} field
 * @param {*} data
 * @returns
 */
exports.syncDocuments = async (collectionId, field, data) => {
  const colRef = firestore.collection(collectionId)
  const query = colRef.where(`${field}.docId`, '==', data.docId)
  const querySnapshot = await query.get()
  if (querySnapshot.empty) return
  const promises = []
  querySnapshot.docs.forEach((doc) => {
    promises.push(doc.ref.update({ [field]: data }))
  })
  await Promise.all(promises)
}
