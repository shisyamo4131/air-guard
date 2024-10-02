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
  'attendance-records': ['admin', 'developer'],
  'leave-applications-unapproved': ['admin'],
  customers: ['admin'],
  'customers-docId': ['admin'],
  equipments: ['admin'],
  'equipments-docId': ['admin'],
  outsourcers: ['admin'],
  'outsourcers-docId': ['admin'],
  sites: ['admin'],
  'sites-docId': ['admin'],
  employees: ['admin'],
  'employees-docId': ['admin'],
  'operation-resuls': ['admin'],
  'operation-billing-bases': ['admin'],
  'synchronize-customers': ['admin', 'developer'],
  'synchronize-employees': ['admin', 'developer'],
  'synchronize-sites': ['admin', 'developer'],
  'synchronize-outsourcers': ['admin', 'developer'],
  'transportation-cost-applications': [],
  'work-regulations': ['admin', 'developer'],
  'work-regulations-docId': ['admin', 'developer'],
  // 以下、開発用ページ
  'developments-model-input': ['admin', 'developer'],
  'developments-sandbox': ['admin', 'developer'],
}
