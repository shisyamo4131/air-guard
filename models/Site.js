/**
 * ### Site.js
 *
 * 現場ドキュメントのデータモデルです。
 *
 * #### 機能詳細
 * 1. ドキュメントの作成時、`customerId`に有効な値がセットされていればCustomerドキュメントを取得して`customer`プロパティにセットします。
 * 2. ドキュメントの更新時、`customerId`に有効な値がセットされており、`customer.docId`と異なる場合、Customerドキュメントを取得して`customer`プロパティを更新します。
 *
 * #### 注意事項
 * 1. AirGuardとの同期設定の都合上、`customer`プロパティの更新は`customerId`に有効な値がセットされている場合にのみ行われます。
 * 2. Customerドキュメントが更新された時の同期処理はCloud Functionsで行われます。
 *
 * @author shisyamo4131
 * @version 1.4.0
 *
 * @updates
 * - version 1.4.0 - 2024-08-09 - `fetchByCode()`を実装。
 *                              - `fetchByCodes()`を実装。
 * - version 1.3.0 - 2024-08-07 - `hasMany`に`OperationResults`を追加。
 * - version 1.2.0 - 2024-07-22 - `props.customerId`を追加。
 *                              - getCustomer()を実装。
 *                              ‐ beforeCreate()で`customer`を取得するように追加。
 *                              - beforeUpdate()で`customer`を更新するように追加。
 * - version 1.1.0 - 2024-07-12 - `hasMany`に`SiteOperationSchedules`を追加。
 * - version 1.0.0 - 2024-07-10 - 初版作成
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import FireModel from './FireModel'

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
    // for spot site and bulk create.
    isSpot: { type: Boolean, default: false, required: false },
    defaultDates: { type: Array, default: () => [], required: false }, // deletable
    defaultSchedule: { type: Object, default: () => ({}), required: false }, // deletable
  },
}
export { props }

export default class Site extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
    this.collection = 'Sites'
    this.hasMany = [
      {
        collection: 'SiteOperationSchedules',
        field: 'siteId',
        condition: '==',
        type: 'subCollection',
      },
      {
        collection: 'OperationResults',
        field: 'siteId',
        condition: '==',
        type: 'subCollection',
      },
    ]
    this.tokenFields = ['abbr', 'abbrKana']
    this.initialize(item)
  }

  /**
   * 初期化メソッド
   * @param {object} item - 初期化するアイテムオブジェクト
   */
  initialize(item = {}) {
    // デフォルト値を設定
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    // 親クラスのinitializeメソッドを呼び出し
    super.initialize(item)
  }

  /**
   * ドキュメントが作成される前に実行される処理です。
   * - `customerId`に対応するCustomerドキュメントを取得して`customer`にセットします。
   */
  async beforeCreate() {
    if (this.customerId) {
      this.customer = await this.getCustomer()
      if (!this.customer) {
        throw new Error('取引先情報が取得できませんでした。')
      }
    }
  }

  /**
   * ドキュメントが更新される前に実行される処理です。
   * - `customerId`と`customer.docId`が異なっていたら、Customerドキュメントを取得して`customer`にセットします。
   */
  async beforeUpdate() {
    if (this.customerId) {
      if (this.customerId !== this.customer.docId) {
        this.customer = await this.getCustomer()
        if (!this.customer) {
          throw new Error('取引先情報が取得できませんでした。')
        }
      }
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
   * @param {string} code
   * @returns {Promise<Array>} 現場ドキュメントデータの配列
   */
  async fetchByCode(code) {
    const colRef = collection(this.firestore, this.collection)
    const q = query(colRef, where('code', '==', code))
    const snapshots = await getDocs(q)
    if (snapshots.empty) return []
    return snapshots.docs.map((doc) => doc.data())
  }

  /**
   * 現場codeの配列を受け取り、該当する現場ドキュメントデータを配列で返します。
   * 現場codeの配列は、重複があれば一意に整理されます。
   * @param {Array<string>} codes
   * @returns {Promise<Array>} 現場ドキュメントデータの配列
   */
  async fetchByCodes(codes) {
    const unique = [...new Set(codes)]
    const chunked = unique.flatMap((_, i) =>
      i % 30 ? [] : [unique.slice(i, i + 30)]
    )
    const colRef = collection(this.firestore, this.collection)
    const snapshots = await Promise.all(
      chunked.map(async (arr) => {
        const q = query(colRef, where('code', 'in', arr))
        const snapshot = await getDocs(q)
        return snapshot.docs.map((doc) => doc.data())
      })
    )
    return snapshots.flat()
  }
}
