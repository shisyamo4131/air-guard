const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { isDocumentChanged, syncDocument } = require('./utils')

exports.onUpdate = onDocumentUpdated('Sites/{docId}', async (event) => {
  const docId = event.params.docId
  if (!isDocumentChanged(event)) return null
  const data = event.data.after.data()
  await syncDocument('OperationResults', 'site', docId, data)
})
