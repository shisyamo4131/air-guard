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
    /* Sync SiteDaylySales */
    await SiteDaylySales.sync(data.site.docId, data.date)
  }
)

exports.onUpdate = onDocumentUpdated(
  'OperationResults/{docId}',
  async (event) => {
    const before = event.data.before.data()
    const after = event.data.after.data()
    if (isDocumentChanged(event, ['site.docId', 'date', 'sales', 'workers'])) {
      /* Sync SiteDaylySales */
      await SiteDaylySales.sync(after.site.docId, after.date)
    }
    if (isDocumentChanged(event, ['site.docId', 'date'])) {
      /* Sync SiteDaylySales */
      await SiteDaylySales.sync(before.site.docId, before.date)
    }
  }
)

exports.onDelete = onDocumentDeleted(
  'OperationResults/{docId}',
  async (event) => {
    const data = event.data.data()
    /* Sync SiteDaylySales */
    await SiteDaylySales.sync(data.site.docId, data.date)
  }
)
