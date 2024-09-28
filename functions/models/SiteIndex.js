/**
 * ## SiteIndex.js
 *
 * Realtime Database で管理される `Sites` のデータモデルです。
 * - コンストラクタの引数には `Sites` ドキュメントのデータを渡します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 */
export default class SiteIndex {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    this.code = item?.code || ''
    this.name = item?.name || ''
    this.abbr = item?.abbr || ''
    this.abbrKana = item?.abbrKana || ''
    this.address = item?.address || ''
    this.customerId = item?.customerId || ''
    this.status = item?.status || ''
  }

  /****************************************************************************
   * toObject
   ****************************************************************************/
  toObject() {
    return { ...this }
  }
}
