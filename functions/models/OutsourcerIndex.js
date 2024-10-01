/**
 * ## OutsourcerIndex.js
 *
 * Realtime Database で管理される `Outsourcers` のデータモデルです。
 * - コンストラクタの引数には `Outsourcers` ドキュメントのデータを渡します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 */
export default class OutsourcerIndex {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    this.code = item?.code || ''
    this.name = item?.name || ''
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
