const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const { info } = require('firebase-functions/logger')
const firestore = getFirestore()

exports.onUpdate = onDocumentUpdated('Sites/{docId}', async (event) => {
  info(`[sites.js] A document of Sites collection has been updated.`)
  info({ before: event.data.before.data(), after: event.data.after.data() })
  const docId = event.params.docId
  const data = event.data.after.data()
  await syncOperationResults(docId, data)
})

async function syncOperationResults(docId, data) {
  info(`[sites.js] Start synchronization to the 'OperationResults' collection.`)
  const colRef = firestore.collection('OperationResults')
  const query = colRef.where('site.docId', '==', docId)
  const querySnapshot = await query.get()
  if (querySnapshot.empty) return
  const promises = []
  querySnapshot.docs.forEach((doc) => {
    promises.push(doc.ref.update({ site: data }))
  })
  await Promise.all(promises)
  info(
    `[sites.js] Synchronization to the 'OperationResults' collection has been completed.`
  )
}
