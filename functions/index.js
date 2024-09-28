// index.js (Cloud Functions エントリーポイント)
import './modules/firebase-init.js' // Firebaseを初期化

import * as auth from './triggers/auth.js'
import * as role from './triggers/role.js'

import * as airGuard from './triggers/air-guard.js'
import * as customers from './triggers/customers.js'
import * as sites from './triggers/sites.js'
import * as siteContracts from './triggers/site-contracts.js'
import * as siteOperationSchedules from './triggers/site-operation-schedules.js'
import * as employees from './triggers/employees.js'
import * as workRegulations from './triggers/work-regulations.js'
import * as operationResults from './triggers/operation-results.js'
import * as maintenance from './modules/maintenance.js'

export {
  auth,
  role,
  airGuard,
  customers,
  sites,
  siteContracts,
  siteOperationSchedules,
  employees,
  workRegulations,
  operationResults,
  maintenance,
}
