/**
 * Sitesドキュメントデータモデル
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
import { doc, getDoc, where } from 'firebase/firestore'
import { FireModel } from 'air-firebase'
import Customer from './Customer'

const props = {
  props: {
    docId: { type: String, default: '', required: false },
    customerId: { type: String, default: '', required: false },
    customer: { type: Object, default: null, required: false },
    code: { type: String, default: '', required: false },
    name: { type: String, default: '', required: false },
    abbr: { type: String, default: '', required: false },
    abbrKana: { type: String, default: '', required: false },
    abbrNumber: { type: String, default: '', required: false },
    address: { type: String, default: '', required: false },
    startAt: { type: String, default: '', required: false },
    endAt: { type: String, default: '', required: false },
    securityType: { type: String, default: '', required: false },
    status: { type: String, default: 'active', required: false },
    remarks: { type: String, default: '', required: false },
    favorite: { type: Boolean, default: false, required: false },
    sync: { type: Boolean, default: false, required: false },
    isSpot: { type: Boolean, default: false, required: false },
  },
}
export { props }

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
      ['abbr', 'abbrKana']
    )
  }

  initialize(item = {}) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }

  /**
   * 自動採番対象
   * @param {string} docId
   */
  async create(docId = null) {
    await super.create({ docId, useAutonumber: true })
  }

  /**
   * クラスインスタンスをオブジェクト形式に変換します。
   * - スーパークラスの `toObject` メソッドを呼び出し、その結果に `customer` プロパティを追加します。
   * - `customer` プロパティが存在し、かつ `toObject` メソッドを持つ場合、そのメソッドを呼び出してオブジェクトに変換します。
   * - `customer` が存在しない場合、もしくは `toObject` メソッドを持たない場合、そのままの値か、空のオブジェクトを返します。
   *
   * @returns {Object} - クラスインスタンスを表すオブジェクト
   */
  toObject() {
    return {
      ...super.toObject(),
      customer:
        this.customer && typeof this.customer.toObject === 'function'
          ? this.customer.toObject()
          : this.customer || {},
    }
  }

  /**
   * Firestoreから取得したデータをクラスインスタンスに変換します。
   * - スーパークラスの `fromFirestore` メソッドを呼び出して基本のインスタンスを取得します。
   * - 取得した `customer` データを新しい `Customer` クラスのインスタンスに変換します。
   *
   * @param {Object} snapshot - Firestoreから取得したドキュメントスナップショット
   * @returns {Object} - クラスインスタンス
   */
  fromFirestore(snapshot) {
    // スーパークラスから基本のインスタンスを生成
    const instance = super.fromFirestore(snapshot)
    // customer データを新しい Customer クラスのインスタンスに変換
    instance.customer = new Customer(instance.customer)
    // 変換したインスタンスを返す
    return instance
  }

  /**
   * ドキュメントが作成される前に実行される処理です。
   * - `customerId`に対応するCustomerドキュメントを取得して`customer`にセットします。
   * @throws {Error} - 取引先が指定されていない、または取得できない場合にエラーをスローします。
   */
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
    } catch (err) {
      // eslint-disable-next-line
      console.error(
        `[Site.js beforeCreate] Error fetching customer: ${err.message}`
      )
      throw err
    }
  }

  /**
   * ドキュメントが更新される前に実行される処理です。
   * - `customerId`と`customer.docId`が異なっていたら、Customerドキュメントを取得して`customer`にセットします。
   * @throws {Error} - 取引先が指定されていない、または取得できない場合にエラーをスローします。
   */
  async beforeUpdate() {
    if (!this.customerId) {
      throw new Error('取引先の指定が必要です。')
    }

    if (this.customer && this.customer.docId === this.customerId) {
      // customerId が変更されていない場合、再取得しない
      return
    }

    try {
      const customer = await new Customer().fetchDoc(this.customerId)
      if (!customer) {
        throw new Error('取引先情報が取得できませんでした。')
      }
      this.customer = customer
    } catch (err) {
      // eslint-disable-next-line
      console.error(
        `[Site.js beforeUpdate] Error fetching customer: ${err.message}`
      )
      throw err
    }
  }

  /**
   * 自身の`customerId`に対応するCustomerドキュメントを取得して返します。
   * @returns
   */
  async getCustomer() {
    const docRef = doc(this.firestore, `Customers/${this.customerId}`)
    const snapshot = await getDoc(docRef)
    return snapshot.exists() ? snapshot.data() : undefined
  }

  /**
   * 指定された現場codeに該当する現場ドキュメントデータを配列で返します。
   * @param {string} code - 現場コード
   * @returns {Promise<Array>} - 現場ドキュメントデータの配列
   * @throws {Error} - エラーが発生した場合にスローされます
   */
  async fetchByCode(code) {
    if (!code) throw new Error('Code is required.')
    try {
      const constraints = [where('code', '==', code)]
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

  /**
   * 現場codeの配列を受け取り、該当する現場ドキュメントデータを配列で返します。
   * 現場codeの配列は、重複があれば一意に整理されます。
   * @param {Array<string>} codes - 現場コードの配列
   * @returns {Promise<Array>} - 現場ドキュメントデータの配列
   * @throws {Error} - 処理中にエラーが発生した場合にスローされます
   */
  async fetchByCodes(codes) {
    if (!Array.isArray(codes) || codes.length === 0) return []
    try {
      const unique = [...new Set(codes)]
      const chunked = unique.flatMap((_, i) =>
        i % 30 ? [] : [unique.slice(i, i + 30)]
      )
      const promises = chunked.map(async (arr) => {
        const constraints = [where('code', 'in', arr)]
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
