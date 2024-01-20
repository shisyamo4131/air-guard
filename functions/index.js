const { initializeApp } = require('firebase-admin/app')
const { setGlobalOptions } = require('firebase-functions/v2')

initializeApp()
setGlobalOptions({ region: 'asia-northeast1' })

exports.role = require('./modules/role')
// exports.airguard = require('./modules/air-guard')
// exports.customers = require('./modules/customers')
// exports.sites = require('./modules/sites')
