/*****************************************************************************
 * カスタムクラス定義: 外注先 - Outsourcer -
 *
 * @author shisyamo4131
 * @refact 2025-02-08
 *****************************************************************************/
import { FireModel } from 'air-firebase'
import { OUTSOURCER_STATUS } from './constants/outsourcer-status'
import { generateProps } from './propsDefinition/propsUtil'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 外注先code
  code: { type: String, default: '', required: false },

  // 外注先名
  name: { type: String, default: '', required: false, requiredByClass: true },

  // 外注先略称
  abbr: { type: String, default: '', required: false, requiredByClass: true },

  // 外注先略称カナ
  abbrKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 郵便番号
  zipcode: { type: String, default: '', required: false },

  // 住所
  address1: { type: String, default: '', required: false },

  // 建物名・階数
  address2: { type: String, default: '', required: false },

  // 電話番号
  tel: { type: String, default: '', required: false },

  // FAX番号
  fax: { type: String, default: '', required: false },

  // 状態
  status: {
    type: String,
    default: 'active',
    required: false,
    validator: (v) => Object.keys(OUTSOURCER_STATUS).includes(v),
    requiredByClass: true,
  },

  // 備考
  remarks: { type: String, default: '', required: false },

  // 同期状態
  sync: { type: Boolean, default: false, required: false },
}

const { vueProps, classProps } = generateProps(propsDefinition)
export { vueProps }

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class Outsourcer extends FireModel {
  // FireModel 設定
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

  /**
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
      const message = `[Outsourcer.js fetchByCodes] ドキュメントの取得中にエラーが発生しました: ${err.message}`
      // eslint-disable-next-line no-console
      console.error(message)
      throw new Error(message)
    }
  }
}

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class OutsourcerMinimal extends Outsourcer {
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
