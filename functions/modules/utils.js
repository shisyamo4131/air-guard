const { getFirestore } = require('firebase-admin/firestore')
const firestore = getFirestore()

/**
 * Firestoreドキュメントの内容に変更があったかどうかを返します。
 * updateDate、updateAt、uidフィールドの変更は対象外とします。
 * @param {*} event FirestoreのonUpdateトリガーのイベントオブジェクト
 * @returns
 */
exports.isDocumentChanged = (event) => {
  const {
    updateDate: beforeUpdateDate,
    updateAt: beforeUpdateAt,
    uid: beforeUid,
    ...before
  } = event.data.before.data()
  const {
    updateDate: afterUpdateDate,
    updateAt: afterUpdateAt,
    uid: afterUid,
    ...after
  } = event.data.after.data()
  const result = JSON.stringify(before) !== JSON.stringify(after)
  return result
}

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
