import Customer from './Customer.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/Site.js'
/**
 * Sitesドキュメントデータモデル【論理削除】
 *
 * - 現場情報を管理するデータモデルです。
 * - `code`は Autonumbers による自動採番が行われます。
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class Site extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Sites'
  static useAutonumber = true
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['abbr', 'abbrKana']
  static hasMany = [
    {
      collection: 'SiteOperationSchedules',
      field: 'siteId',
      condition: '==',
      type: 'subcollection',
    },
    {
      collection: 'OperationResults',
      field: 'siteId',
      condition: '==',
      type: 'collection',
    },
  ]

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    customer: Customer,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.create
    delete this.update
    delete this.delete
  }

  /****************************************************************************
   * 指定された現場codeに該当する現場ドキュメントデータを配列で返します。
   * @param {string} code - 現場コード
   * @returns {Promise<Array>} - 現場ドキュメントデータの配列
   * @throws {Error} - エラーが発生した場合にスローされます
   ****************************************************************************/
  async fetchByCode(code) {
    if (!code) throw new Error('Code is required.')
    try {
      const constraints = [['where', 'code', '==', code]]
      const snapshots = await this.fetchDocs(constraints)
      return snapshots
    } catch (err) {
      // eslint-disable-next-line
      console.error(
        `[Site.js fetchByCode] Error fetching documents for code ${code}: ${err.message}`
      )
      throw err
    }
  }

  /****************************************************************************
   * 現場codeの配列を受け取り、該当する現場ドキュメントデータを配列で返します。
   * 現場codeの配列は、重複があれば一意に整理されます。
   * @param {Array<string>} codes - 現場コードの配列
   * @returns {Promise<Array>} - 現場ドキュメントデータの配列
   * @throws {Error} - 処理中にエラーが発生した場合にスローされます
   ****************************************************************************/
  async fetchByCodes(codes) {
    if (!Array.isArray(codes) || codes.length === 0) return []
    try {
      const unique = [...new Set(codes)]
      const chunked = unique.flatMap((_, i) =>
        i % 30 ? [] : [unique.slice(i, i + 30)]
      )
      const promises = chunked.map(async (arr) => {
        const constraints = [['where', 'code', 'in', arr]]
        return await this.fetchDocs(constraints)
      })
      const snapshots = await Promise.all(promises)
      return snapshots.flat()
    } catch (err) {
      // eslint-disable-next-line
      console.error(
        `[Site.js fetchByCodes] Error fetching documents: ${err.message}`
      )
      throw err
    }
  }
}
