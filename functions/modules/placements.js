const { onDocumentDeleted } = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const firestore = getFirestore()

exports.removed = onDocumentDeleted('Placements/{docId}', async (event) => {
  const colRef = firestore.collection(
    `Placements/${event.params.docId}/PlacementDetails`
  )
  const snapshot = await colRef.get()
  const promises = []
  snapshot.docs.forEach((doc) => {
    promises.push(doc.ref.delete())
  })
  await Promise.all(promises)
})
