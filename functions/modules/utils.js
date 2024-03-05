const { getFirestore } = require('firebase-admin/firestore')
const firestore = getFirestore()

/**
 * Firestoreドキュメントの内容に変更があったかどうかを返します。
 * @param {*} event onDocumentUpdatedトリガーのイベントオブジェクト
 * @returns
 */
exports.isDocumentChanged = (event, fields) => {
  /* Check the event object. */
  const before = event?.data?.before?.data() || undefined
  const after = event?.data?.after?.data() || undefined
  if (!before || !after)
    throw new Error('onDocumentUpdatedのeventオブジェクトが必要です。')
  return fields.some((field) => {
    return JSON.stringify(before[field]) !== JSON.stringify(after[field])
  })
}

/**
 * 非正規化されたドキュメントデータを同期させます。
 * @param {*} collectionId
 * @param {*} field
 * @param {*} docId
 * @param {*} data
 * @returns
 */
exports.syncDocument = async (collectionId, field, docId, data) => {
  const colRef = firestore.collection(collectionId)
  const query = colRef.where(`${field}.docId`, '==', docId)
  const querySnapshot = await query.get()
  if (querySnapshot.empty) return
  const promises = []
  querySnapshot.docs.forEach((doc) => {
    promises.push(doc.ref.update({ [field]: data }))
  })
  await Promise.all(promises)
}
