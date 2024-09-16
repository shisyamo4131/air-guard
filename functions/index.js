const { initializeApp } = require('firebase-admin/app')
const { setGlobalOptions } = require('firebase-functions/v2')

initializeApp()
setGlobalOptions({ region: 'asia-northeast1' })

exports.auth = require('./triggers/auth')
exports.role = require('./triggers/role')

exports.airGuard = require('./triggers/air-guard')
exports.customers = require('./triggers/customers')
exports.sites = require('./triggers/sites')
exports.employees = require('./triggers/employees')
exports.workRegulations = require('./triggers/work-regulations')
