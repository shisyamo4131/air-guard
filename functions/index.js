const { initializeApp } = require('firebase-admin/app')
const { setGlobalOptions } = require('firebase-functions/v2')

initializeApp()
setGlobalOptions({ region: 'asia-northeast1' })

exports.auth = require('./modules/auth')
exports.role = require('./modules/role')

exports.airGuard = require('./modules/air-guard')

exports.employees = require('./modules/employees')

exports.customers = require('./modules/customers')
exports.sites = require('./modules/sites')
exports.siteOperationSchedules = require('./modules/site-operation-schedules')
exports.siteOperationScheduleBulks = require('./modules/site-operation-schedule-bulks')

// exports.operationResults = require('./triggers/operation-results')
