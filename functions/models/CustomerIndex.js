/**
 * ## CustomerIndex.js
 *
 * Realtime Database で管理される `Customers` のデータモデルです。
 * - コンストラクタの引数には `Customers` ドキュメントのデータを渡します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 */
export default class CustomerIndex {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    this.code = item?.code || ''
    this.name1 = item?.name1 || ''
    this.name2 = item?.name2 || ''
    this.abbr = item?.abbr || ''
    this.abbrKana = item?.abbrKana || ''
    this.address1 = item?.address1 || ''
    this.status = item?.status || ''
  }

  /****************************************************************************
   * toObject
   ****************************************************************************/
  toObject() {
    return { ...this }
  }
}
