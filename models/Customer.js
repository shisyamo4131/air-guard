import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/Customer'

/**
 * 取引先ドキュメントデータモデル【論理削除】
 * - 取引先情報を管理するデータモデルです。
 * - `code`は Autonumbers による自動採番が行われます。
 * @author shisyamo4131
 * @refact 2025-01-30
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

/**
 * Customer クラスから createAt, updateAt, uid, remarks, tokenMap を削除したクラスです。
 * - 非正規化した customer プロパティを持つドキュメントに保存するデータを提供するためのクラス
 * - 不要なプロパティを削除することでデータ量を抑制するために使用します。
 * - 更新系のメソッドは利用できません。
 */
export class CustomerMinimal extends Customer {
  /****************************************************************************
   * INITIALIZE
   ****************************************************************************/
  initialize(item = {}) {
    super.initialize(item)

    delete this.createAt
    delete this.updateAt
    delete this.uid
    delete this.remarks
    delete this.tokenMap
  }

  /****************************************************************************
   * 更新系メソッドは使用不可
   ****************************************************************************/
  create() {
    return Promise.reject(new Error('このクラスの create は使用できません。'))
  }

  update() {
    return Promise.reject(new Error('このクラスの update は使用できません。'))
  }

  delete() {
    return Promise.reject(new Error('このクラスの delete は使用できません。'))
  }
}
