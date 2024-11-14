import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/Customer'

/**
 * Customersドキュメントデータモデル【論理削除】
 *
 * - 取引先情報を管理するデータモデルです。
 * - `code`は Autonumbers による自動採番が行われます。
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class Customer extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Customers'
  static useAutonumber = true
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['abbr', 'abbrKana']
  static hasMany = [
    {
      collection: 'Sites',
      field: 'customer.docId',
      condition: '==',
      type: 'collection',
    },
  ]

  /****************************************************************************
   * 指定された取引先codeに該当する取引先ドキュメントデータを配列で返します。
   * @param {string} code - 取引先コード
   * @returns {Promise<Array>} - 取引先ドキュメントデータの配列
   * @throws {Error} - エラーが発生した場合にスローされます
   ****************************************************************************/
  async fetchByCode(code) {
    if (!code) throw new Error('取引先コードは必須です。')
    try {
      const constraints = [['where', 'code', '==', code]]
      const snapshots = await this.fetchDocs(constraints)
      return snapshots
    } catch (err) {
      const message = `[Customer.js fetchByCode] 取引先コード ${code} に対するドキュメントの取得に失敗しました: ${err.message}`
      // eslint-disable-next-line no-console
      console.error(message)
      throw new Error(message)
    }
  }

  /****************************************************************************
   * 取引先codeの配列を受け取り、該当する取引先ドキュメントデータを配列で返します。
   * 取引先codeの配列は、重複があれば一意に整理されます。
   *
   * 2024-11-14 - 同期設定がなされたもののみを返すように変更
   * -> 稼働実績の取り込み時に、スポット登録された現場があると CODE 重複で意図しない
   *    マスタと紐づけられてしまう為。
   *
   * @param {Array<string>} codes - 取引先コードの配列
   * @returns {Promise<Array>} - 取引先ドキュメントデータの配列
   * @throws {Error} - 処理中にエラーが発生した場合にスローされます
   ****************************************************************************/
  async fetchByCodes(codes) {
    if (!Array.isArray(codes) || codes.length === 0) return []
    try {
      const unique = [...new Set(codes)]
      const chunked = unique.flatMap((_, i) =>
        i % 30 ? [] : [unique.slice(i, i + 30)]
      )
      const promises = chunked.map((arr) => {
        const constraints = [['where', 'code', 'in', arr]]
        return this.fetchDocs(constraints)
      })
      const snapshots = await Promise.all(promises)
      // return snapshots.flat()
      return snapshots.flat().filter((item) => item.sync)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        `[Customer.js fetchByCodes] Error fetching documents: ${err.message}`
      )
      throw new Error(`Error fetching documents for codes: ${err.message}`)
    }
  }
}
