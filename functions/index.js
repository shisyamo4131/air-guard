const { initializeApp } = require('firebase-admin/app')
const { setGlobalOptions } = require('firebase-functions/v2')

initializeApp()
setGlobalOptions({ region: 'asia-northeast1' })

exports.role = require('./modules/role')
exports.customers = require('./modules/customers')
exports.sites = require('./modules/sites')

exports.operationResults = require('./modules/operation-results')
exports.siteDaylySales = require('./modules/site-dayly-sales')
