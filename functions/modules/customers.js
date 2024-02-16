const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const { info } = require('firebase-functions/logger')
const firestore = getFirestore()

exports.onUpdate = onDocumentUpdated('Customers/{docId}', async (event) => {
  info(`[customer.js] A document of Customers collection has been updated.`)
  info({ before: event.data.before.data(), after: event.data.after.data() })
  const docId = event.params.docId
  const data = event.data.after.data()
  await syncSites(docId, data)
})

async function syncSites(docId, data) {
  info(`[customer.js] Start synchronization to the 'Sites' collection.`)
  const colRef = firestore.collection('Sites')
  const query = colRef.where('customer.docId', '==', docId)
  const querySnapshot = await query.get()
  if (querySnapshot.empty) return
  const promises = []
  querySnapshot.docs.forEach((doc) => {
    promises.push(doc.ref.update({ customer: data }))
  })
  await Promise.all(promises)
  info(
    `[customer.js] Synchronization to the 'Sites' collection has been completed.`
  )
}
