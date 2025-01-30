// index.js (Cloud Functions エントリーポイント)
import './modules/firebase-init.js' // Firebaseを初期化

import * as auth from './triggers/auth.js'
import * as role from './triggers/role.js'

import * as airGuard from './triggers/air-guard.js'
// import * as customers from './triggers/customers.js'
import * as sites from './triggers/sites.js'
import * as siteContracts from './triggers/site-contracts.js'
import * as siteOperationSchedules from './triggers/site-operation-schedules.js'
import * as employees from './triggers/employees.js'
import * as employeeContracts from './triggers/employee-contracts.js'
import * as operationResults from './triggers/operation-results.js'
import * as operationWorkResults from './triggers/operation-work-results.js'
import * as maintenance from './modules/maintenance.js'
import * as outsourcers from './triggers/outsourcers.js'
import * as newUsers from './triggers/new-users.js'
import * as users from './triggers/users.js'
import * as system from './modules/system.js'
import * as masterDocuments from './triggers/master-documents.js'
import * as equipments from './triggers/equipments.js'

/**
 * APIによる同期処理
 */
import * as access from './access/accessApi.js'

export {
  auth,
  role,
  airGuard,
  // customers,
  sites,
  siteContracts,
  siteOperationSchedules,
  employees,
  employeeContracts,
  operationResults,
  operationWorkResults,
  maintenance,
  outsourcers,
  newUsers,
  users,
  system,
  access,
  masterDocuments,
  equipments,
}
