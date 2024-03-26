const {
  onDocumentUpdated,
  onDocumentCreated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const SiteDaylySales = require('../models/SiteDaylySales')
const { isDocumentChanged } = require('./utils')

exports.onCreate = onDocumentCreated(
  'OperationResults/{docId}',
  async (event) => {
    const data = event.data.data()
    const promises = []
    promises.push(syncSiteDaylySales(data.site.docId, data.date))
    await Promise.all(promises)
  }
)

exports.onUpdate = onDocumentUpdated(
  'OperationResults/{docId}',
  async (event) => {
    const before = event.data.before.data()
    const after = event.data.after.data()
    const promises = []
    if (isDocumentChanged(event, ['site.docId', 'date', 'sales', 'workers'])) {
      promises.push(syncSiteDaylySales(after.site.docId, after.date))
    }
    if (isDocumentChanged(event, ['site.docId', 'date'])) {
      promises.push(syncSiteDaylySales(before.site.docId, before.date))
    }
    await Promise.all(promises)
  }
)

exports.onDelete = onDocumentDeleted(
  'OperationResults/{docId}',
  async (event) => {
    const data = event.data.data()
    const promises = []
    promises.push(syncSiteDaylySales(data.site.docId, data.date))
    await Promise.all(promises)
  }
)

const syncSiteDaylySales = async (siteId, date) => {
  const model = new SiteDaylySales(siteId, date)
  await model.sync()
}
