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
  'attendance-records': ['admin', 'developer'],
  'leave-applications-unapproved': ['admin'],
  'temporary-site-schedules': ['admin', 'developer'],
  customers: ['admin'],
  'customers-docId': ['admin'],
  'developments-sandbox': ['admin'],
  'developments-models': ['admin'],
  equipments: ['admin'],
  'equipments-docId': ['admin'],
  outsourcers: ['admin'],
  'outsourcers-docId': ['admin'],
  sites: ['admin'],
  'sites-docId': ['admin'],
  'sites-expired': [],
  employees: ['admin'],
  'employees-docId': ['admin'],
  'operation-resuls': ['admin'],
  'operation-resuls-regist': ['admin'],
  'operation-resuls-docId': ['admin'],
  'operation-resuls-docId-edit': ['admin'],
  'synchronize-customers': ['admin', 'developper'],
  'synchronize-employees': ['admin', 'developper'],
  'synchronize-sites': ['admin', 'developper'],
}
