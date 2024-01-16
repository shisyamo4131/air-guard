const {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const { info } = require('firebase-functions/logger')
const tokenMap = require('./tokenMap')
const TOKEN_FIELDS = ['abbr', 'abbrKana']

exports.onCreate = onDocumentCreated('Customers/{docId}', async (event) => {
  info(`A document of Customers collection has been created.`)
  const docId = event.params.docId
  const data = event.data.data()
  await tokenMap.sync('Customers', docId, data, TOKEN_FIELDS)
  info(`The document for the token map has been created successfull.`)
})

exports.onUpdate = onDocumentUpdated('Customers/{docId}', async (event) => {
  info(`A document of Customers collection has been updated.`)
  const docId = event.params.docId
  const data = event.data.after.data()
  await tokenMap.sync('Customers', docId, data, TOKEN_FIELDS)
  info(`The document for the token map has been updated successfull.`)
})

exports.onDelete = onDocumentDeleted('Customers/{docId}', async (event) => {
  info(`A document of Customers collection has been deleted.`)
  const docId = event.params.docId
  await tokenMap.remove('Customers', docId)
  info(`The document created for the token map has been deleted successfull.`)
})
