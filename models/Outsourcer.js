import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/Outsourcer'

/**
 * ## Outsourcersドキュメントデータモデル【論理削除】
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class Outsourcer extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Outsourcers'
  static useAutonumber = true
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['abbr', 'abbrKana']
  static hasMany = [
    {
      collection: 'OperationResults',
      field: 'outsourcerIds',
      condition: 'array-contains',
      type: 'collection',
    },
  ]

  /****************************************************************************
   * 外注先codeの配列を受け取り、該当する外注先ドキュメントデータを配列で返します。
   * 外注先codeの配列は、重複があれば一意に整理されます。
   *
   * 2024-11-14 - 同期設定がなされたもののみを返すように変更
   * -> 稼働実績の取り込み時に、スポット登録された現場があると CODE 重複で意図しない
   *    マスタと紐づけられてしまう為。
   *
   * @param {Array<string>} codes - 外注先コードの配列
   * @returns {Promise<Array>} - 外注先ドキュメントデータの配列
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
      const message = `[Outsourcer.js fetchByCodes] ドキュメントの取得中にエラーが発生しました: ${err.message}`
      // eslint-disable-next-line no-console
      console.error(message)
      throw new Error(message)
    }
  }
}
