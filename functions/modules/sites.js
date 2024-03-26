const {
  onDocumentUpdated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const { syncDocuments, isDocumentChanged } = require('./utils')
const firestore = getFirestore()

exports.onUpdate = onDocumentUpdated('Sites/{docId}', async (event) => {
  const data = event.data.after.data()
  if (isDocumentChanged(event)) {
    await syncDocuments('OperationResults', 'site', data)
  }
})

exports.onDelete = onDocumentDeleted('Sites/{docId}', async (event) => {
  const docId = event.params.docId
  await deleteSubCollections(docId)
})

const deleteSubCollections = async (docId) => {
  const collectionIds = [
    'SiteDaylySales',
    'SiteMonthlySales',
    'SiteYearlySales',
    'SiteContracts',
  ]
  for (const collectionId of collectionIds) {
    const colRef = firestore.collection(`Sites/${docId}/${collectionId}`)
    const querySnapshot = await colRef.get()
    const promises = querySnapshot.docs.map((doc) => doc.ref.delete())
    await Promise.all(promises)
  }
}
