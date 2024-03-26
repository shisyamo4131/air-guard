const { onDocumentWritten } = require('firebase-functions/v2/firestore')
const SiteMonthlySales = require('../models/SiteMonthlySales')

exports.onModify = onDocumentWritten(
  'Sites/{siteId}/SiteDaylySales/{date}',
  async (event) => {
    const siteId = event.params.siteId
    const month = event.params.date.substring(0, 7)
    await SiteMonthlySales.sync(siteId, month)
  }
)
