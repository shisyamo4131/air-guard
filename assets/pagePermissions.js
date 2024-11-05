/**
 * ページ（URL）毎のPermissionを設定
 * ルート以下のURLを、スラッシュをハイフンに書き換えた文字列をkeyとし、
 * 当該URLへのPermissionを配列で指定する。
 * 配列の要素は文字列で、Authenticationsのroleに設定されるものを使用する。
 * ※roleの設定はCloud Functions
 * 配列が空の場合はすべて許可される。
 */
module.exports = {
  'admin-autonumbers': ['admin', 'developer'],
  'admin-import-masters': ['admin', 'developer'],
  'admin-import-transactions': ['admin', 'developer'],
  'admin-work-regulations': ['admin', 'developer'],
  'admin-work-regulations-docId': ['admin', 'developer'],
  'admin-maintenance': ['admin', 'developer'],
  'admin-users': ['admin', 'developer'],
  customers: ['admin', 'developer'],
  'customers-docId': ['admin', 'developer'],
  employees: ['admin', 'developer'],
  'employees-docId': ['admin', 'developer'],
  equipments: ['admin', 'developer'],
  'equipments-docId': ['admin', 'developer'],
  'leave-applications-unapproved': ['admin', 'developer'],
  'monthly-attendances': ['admin', 'developer'],
  'monthly-billings': ['admin', 'developer'],
  'monthly-sales': ['admin', 'developer'],
  'operation-results': ['admin', 'developer'],
  'operation-billing-bases': ['admin', 'developer'],
  outsourcers: ['admin', 'developer'],
  'outsourcers-docId': ['admin', 'developer'],
  placements: [],
  sites: ['admin', 'developer'],
  'sites-docId': ['admin', 'developer'],
  'synchronize-customers': ['admin', 'developer'],
  'synchronize-employees': ['admin', 'developer'],
  'synchronize-sites': ['admin', 'developer'],
  'synchronize-outsourcers': ['admin', 'developer'],
  'transportation-cost-applications': ['admin', 'developer'],
  'work-regulations': ['admin', 'developer'],
  'work-regulations-docId': ['admin', 'developer'],
  // 以下、開発用ページ
  'developments-model-input': ['admin', 'developer'],
  'developments-sandbox': ['admin', 'developer'],
}
