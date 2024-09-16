import { FireModel } from 'air-firebase'
import Customer from './Customer'
import { classProps } from './propsDefinition/Site'

/**
 * ## Sitesドキュメントデータモデル【論理削除】
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class Site extends FireModel {
  constructor(item = {}) {
    super(
      item,
      'Sites',
      [
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
      ],
      true,
      ['abbr', 'abbrKana'],
      classProps
    )
  }

  /****************************************************************************
   * FireModelのcreateメソッドをオーバーライドします。
   * - コレクションを自動採番対象として、useAutonumberをデフォルトでtrueに設定します。
   * - AirGuardとの同期処理を行う場合、自動採番を行わず登録するケースにも対応します。
   * @param {string|null} docId - 作成するドキュメントのID（省略可能）
   * @param {boolean} [useAutonumber=true] - 自動採番を行うかどうか（デフォルト: true）
   * @returns {Promise<DocumentReference>} - 作成されたドキュメントのリファレンス
   * @throws {Error} ドキュメントの作成に失敗した場合にエラーをスローします
   ****************************************************************************/
  async create({ docId = null, useAutonumber = true } = {}) {
    try {
      return await super.create({ docId, useAutonumber })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('ドキュメントの作成に失敗しました:', error)
      throw new Error('ドキュメントの作成中にエラーが発生しました。')
    }
  }

  /****************************************************************************
   * クラスインスタンスをオブジェクト形式に変換します。
   * - スーパークラスの `toObject` メソッドを呼び出し、その結果に `customer` プロパティを追加します。
   * - `customer` プロパティが存在し、かつ `toObject` メソッドを持つ場合、そのメソッドを呼び出してオブジェクトに変換します。
   * - `customer` が存在しない場合、もしくは `toObject` メソッドを持たない場合、そのままの値か、空のオブジェクトを返します。
   *
   * @returns {Object} - クラスインスタンスを表すオブジェクト
   ****************************************************************************/
  toObject() {
    return {
      ...super.toObject(),
      customer:
        this.customer && typeof this.customer.toObject === 'function'
          ? this.customer.toObject()
          : this.customer || null,
    }
  }

  /****************************************************************************
   * Firestoreから取得したデータをクラスインスタンスに変換します。
   * - スーパークラスの `fromFirestore` メソッドを呼び出して基本のインスタンスを取得します。
   * - 取得した `customer` データを新しい `Customer` クラスのインスタンスに変換します。
   * - `customer` が存在しない場合、`null` を引数として渡して `Customer` のインスタンスを作成します。
   *
   * @param {Object} snapshot - Firestoreから取得したドキュメントスナップショット
   * @returns {Object} - クラスインスタンス
   ****************************************************************************/
  fromFirestore(snapshot) {
    // スーパークラスから基本のインスタンスを生成
    const instance = super.fromFirestore(snapshot)

    // customer データを新しい Customer クラスのインスタンスに変換
    instance.customer = new Customer(instance?.customer || undefined)

    // 変換したインスタンスを返す
    return instance
  }

  /****************************************************************************
   * beforeCreateをオーバーライドします。
   * - `customerId`の入力チェックを行います。
   * - `customerId`に該当する`customer`オブジェクトを取得・セットします。
   * - validatePropertiesを行う為、super.beforeCreateを呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeCreate() {
    if (!this.customerId) {
      throw new Error('取引先の指定が必要です。')
    }
    try {
      const customer = await new Customer().fetchDoc(this.customerId)
      if (!customer) {
        throw new Error('取引先情報が取得できませんでした。')
      }
      this.customer = customer
      await super.beforeCreate()
    } catch (err) {
      // eslint-disable-next-line
      console.error(
        `[Site.js beforeCreate] Error fetching customer: ${err.message}`
      )
      throw err
    }
  }

  /****************************************************************************
   * beforeUpdateをオーバーライドします。
   * - `customerId`と`customer.docId`が異なっていたら、Customerドキュメントを取得して`customer`にセットします。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   * @throws {Error} - 取引先が指定されていない、または取得できない場合にエラーをスローします。
   ****************************************************************************/
  async beforeUpdate() {
    if (!this.customerId) {
      throw new Error('取引先の指定が必要です。')
    }
    if (this.customer.docId !== this.customerId) {
      try {
        const customer = await new Customer().fetchDoc(this.customerId)
        if (!customer) {
          throw new Error('取引先情報が取得できませんでした。')
        }
        this.customer = customer
        await super.beforeUpdate()
      } catch (err) {
        // eslint-disable-next-line
        console.error(
          `[Site.js beforeUpdate] Error fetching customer: ${err.message}`
        )
        throw err
      }
    }
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
