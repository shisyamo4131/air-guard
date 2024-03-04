const {
  onDocumentUpdated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const { isDocumentChanged, syncDocument } = require('./utils')
const firestore = getFirestore()

exports.onUpdate = onDocumentUpdated('Sites/{docId}', async (event) => {
  const docId = event.params.docId
  if (!isDocumentChanged(event)) return null
  const data = event.data.after.data()
  await syncDocument('OperationResults', 'site', docId, data)
})

exports.onDelete = onDocumentDeleted('Sites/{docId}', async (event) => {
  const docId = event.params.docId
  await deleteSubCollections(docId)
})

const deleteSubCollections = async (docId) => {
  const collectionIds = ['SiteDaylySales']
  for (const collectionId of collectionIds) {
    const colRef = firestore.collection(`Sites/${docId}/${collectionId}`)
    const querySnapshot = await colRef.get()
    const promises = querySnapshot.docs.map((doc) => doc.ref.delete())
    await Promise.all(promises)
  }
}
