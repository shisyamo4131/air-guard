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
  'leave-applications': [],
  customers: [],
  'customers-regist': [],
  'customers-docId': [],
  'customers-docId-edit': [],
  'developments-sandbox': [],
  'developments-models': [],
  sites: [],
  'sites-regist': [],
  'sites-docId': [],
  'sites-docId-edit': [],
  employees: [],
  'employees-regist': [],
  'employees-docId': [],
  'employees-docId-edit': [],
  'operation-resuls': [],
  'operation-resuls-regist': [],
  'operation-resuls-docId': [],
  'operation-resuls-docId-edit': [],
  imports: ['admin', 'developer'],
  placements: [],
}
