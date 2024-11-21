/**
 * ## EmployeeIndex.js
 *
 * Realtime Database で管理される `Employees` のデータモデルです。
 * - コンストラクタの引数には `Employees` ドキュメントのデータを渡します。
 *
 * @author shisyamo4131
 */
export default class EmployeeIndex {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    this.code = item.code ?? ''
    this.fullName = item.fullName ?? ''
    this.fullNameKana = item.fullNameKana ?? ''
    this.abbr = item.abbr ?? ''
    this.abbrKana = item.abbrKana ?? ''
    this.address1 = item.address1 ?? ''
    this.address2 = item.address2 ?? ''
    this.mobile = item.mobile ?? ''
    this.status = item.status ?? ''
    this.contractType = item.contractType ?? ''
    this.designation = item.designation ?? ''
    this.sync = item.sync ?? false
  }

  /****************************************************************************
   * toObject
   ****************************************************************************/
  toObject() {
    return { ...this }
  }
}
