const { onDocumentWritten } = require('firebase-functions/v2/firestore')
const SiteYearlySales = require('../models/SiteYearlySales')

exports.onModify = onDocumentWritten(
  'Sites/{siteId}/SiteMonthlySales/{month}',
  async (event) => {
    const siteId = event.params.siteId
    const year = event.params.month.substring(0, 4)
    await SiteYearlySales.sync(siteId, year)
  }
)
