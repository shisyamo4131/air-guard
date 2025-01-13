/**
 * ページ（URL）毎のPermissionを設定
 * ルート以下のURLを、スラッシュをハイフンに書き換えた文字列をkeyとし、
 * 当該URLへのPermissionを配列で指定する。
 * 配列の要素は文字列で、Authenticationsのroleに設定されるものを使用する。
 * ※roleの設定はCloud Functions
 * 配列が空の場合はすべて許可される。
 */
module.exports = {
  // 管制業務
  placements: [],
  'site-operation-schedules': ['admin', 'developer', 'manager'],
  'leave-applications': ['admin', 'developer'],
  'operation-results': ['admin', 'developer'],
  'monthly-attendances': ['admin', 'developer'],

  // 人事管理
  employees: ['admin', 'developer'],
  'employement-insurances': ['admin', 'developer'],
  'health-insurances': ['admin', 'developer'],
  pensions: ['admin', 'developer'],
  'medical-checkups': ['admin', 'developer'],

  // 経理業務
  'operation-billing-bases': ['admin', 'developer'],
  'monthly-billings': ['admin', 'developer'],
  'transportation-cost-applications': ['admin', 'developer'],

  'monthly-sales': ['admin', 'developer'],

  // マスタ管理
  customers: ['admin', 'developer'],
  'customers-docId': ['admin', 'developer'],
  'employees-docId': ['admin', 'developer'],
  sites: ['admin', 'developer', 'manager'],
  'sites-docId': ['admin', 'developer', 'manager'],
  outsourcers: ['admin', 'developer'],
  'outsourcers-docId': ['admin', 'developer'],
  equipments: ['admin', 'developer'],
  'equipments-docId': ['admin', 'developer'],
  allowances: ['admin', 'developer'],

  // 同期設定
  'synchronize-customers': ['admin', 'developer'],
  'synchronize-employees': ['admin', 'developer'],
  'synchronize-sites': ['admin', 'developer'],
  'synchronize-outsourcers': ['admin', 'developer'],

  // 設定・管理
  settings: ['admin', 'developer'],
  'admin-users': ['admin', 'developer'],
  holidays: ['admin', 'developer'],
  'admin-autonumbers': ['admin', 'developer'],
  'admin-import-masters': ['admin', 'developer'],
  'admin-import-transactions': ['admin', 'developer'],
  'admin-work-regulations': ['admin', 'developer'],
  'admin-work-regulations-docId': ['admin', 'developer'],
  'admin-maintenance': ['admin', 'developer'],

  // 以下、開発用ページ
  'developments-sandbox': ['admin', 'developer'],

  // コンポーネント
  'developments-components-buttons': ['admin', 'developer'],
}
