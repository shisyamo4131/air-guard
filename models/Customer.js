/*****************************************************************************
 * カスタムクラス定義: 取引先 - Customer -
 *
 * @author shisyamo4131
 * @refact 2025-02-01
 *****************************************************************************/
import { FireModel } from 'air-firebase'
import { generateProps } from './propsDefinition/propsUtil'
import { CUSTOMER_STATUS } from './constants/customer-status'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 取引先code
  code: { type: String, default: '', required: false },

  // 取引先名1
  name1: { type: String, default: '', required: false, requiredByClass: true },

  // 取引先名2
  name2: { type: String, default: '', required: false },

  // 取引先名略称
  abbr: { type: String, default: '', required: false, requiredByClass: true },

  // 取引先名略称カナ
  abbrKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 郵便番号
  zipcode: {
    type: String,
    default: '',
    required: false,
  },

  // 住所
  address1: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 建物名・階数
  address2: {
    type: String,
    default: '',
    required: false,
  },

  // 電話番号
  tel: { type: String, default: '', required: false },

  // FAX番号
  fax: { type: String, default: '', required: false },

  // 状態
  status: {
    type: String,
    default: 'active',
    validator: (v) => Object.keys(CUSTOMER_STATUS).includes(v),
    required: false,
    requiredByClass: true,
  },

  // 締日
  deadline: {
    type: String,
    default: '99',
    validator: (v) => ['05', '10', '15', '20', '25', '99'].includes(v),
    required: false,
    requiredByClass: true,
  },

  // 入金サイト（月）
  depositMonth: {
    type: Number,
    default: 1,
    validator: (v) => v > 0,
    required: false,
    requiredByClass: true,
  },

  // 入金サイト（日）
  depositDate: {
    type: String,
    default: '99',
    validator: (v) => ['05', '10', '15', '20', '25', '99'].includes(v),
    required: false,
    requiredByClass: true,
  },

  // 備考
  remarks: {
    type: String,
    default: '',
    required: false,
  },

  // 同期状態
  sync: {
    type: Boolean,
    default: false,
    required: false,
  },

  // 自社情報フラグ
  isInternal: {
    type: Boolean,
    default: false,
    required: false,
  },
}

const { vueProps, classProps } = generateProps(propsDefinition)
export { vueProps }

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class Customer extends FireModel {
  // FireModel 設定
  static collectionPath = 'Customers'
  static useAutonumber = true
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['abbr', 'abbrKana']
  static hasMany = [
    {
      collection: 'Sites',
      field: 'customerId',
      condition: '==',
      type: 'collection',
    },
  ]

  /**
   * 指定された取引先codeに該当する取引先ドキュメントデータを配列で返します。
   * @param {string} code - 取引先コード
   * @returns {Promise<Array>} - 取引先ドキュメントデータの配列
   * @throws {Error} - エラーが発生した場合にスローされます
   */
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

  /**
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
   */
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

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class CustomerMinimal extends Customer {
  // initialize をオーバーライド
  initialize(item = {}) {
    super.initialize(item)
    delete this.createAt
    delete this.updateAt
    delete this.uid
    delete this.remarks
    delete this.tokenMap
  }

  // 更新系メソッドは使用不可
  create() {
    return Promise.reject(new Error('このクラスの create は使用できません。'))
  }

  update() {
    return Promise.reject(new Error('このクラスの update は使用できません。'))
  }

  delete() {
    return Promise.reject(new Error('このクラスの delete は使用できません。'))
  }

  deleteAll() {
    return Promise.reject(
      new Error('このクラスの deleteAll は使用できません。')
    )
  }

  restore() {
    return Promise.reject(new Error('このクラスの restore は使用できません。'))
  }
}
