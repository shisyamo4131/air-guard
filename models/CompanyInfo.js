/*****************************************************************************
 * カスタムクラス定義: 自社情報 - CompanyInfo -
 *
 * @author shisyamo4131
 * @refact 2025-02-01
 *****************************************************************************/
import { FireModel } from 'air-firebase'
import { generateProps } from './propsDefinition/propsUtil'

/**
 * PROPERTIES
 */
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 会社名1
  name1: { type: String, default: '', required: true },

  // 会社名2
  name2: { type: String, default: '', required: false },

  // 郵便番号
  zipcode: { type: String, default: '', required: true },

  // 住所
  address1: { type: String, default: '', required: true },

  // 建物名・階数
  address2: { type: String, default: '', required: false },

  // 電話番号
  tel: { type: String, default: '', required: false },

  // FAX番号
  fax: { type: String, default: '', required: false },

  // 法人番号
  corporateNumber: { type: String, default: '', required: false },

  // 代表者名
  executiveName: { type: String, default: '', required: false },

  // 代表者肩書
  executiveTitle: { type: String, default: '', required: false },
}

const { vueProps, classProps } = generateProps(propsDefinition)
export { vueProps }

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class CompanyInfo extends FireModel {
  // FireModel 設定
  static collectionPath = 'CompanyInfo'
  static logicalDelete = false
  static classProps = classProps

  // initialize をオーバーライド
  initialize(item = {}) {
    super.initialize(item)
    delete this.tokenMap
  }

  /**
   * create をオーバーライドします。
   * - 唯一のドキュメントであり、ドキュメントIDは `companyInfo` に固定されます。
   * @returns {Promise<DocumenntReference>} - 作成された CompanyInfo ドキュメントへの参照
   */
  async create() {
    return await super.create({ docId: 'companyInfo' })
  }

  /**
   * fetch をオーバーライドします。
   * - 与えられた引数は無視され、`companiInfo` を docId とするドキュメントが読み込まれます。
   * @returns {Promise<boolean>} - 読み込みに成功すると true を、失敗すると false を返します。
   */
  async fetch() {
    return await super.fetch(`companyInfo`)
  }

  /**
   * fetchDoc をオーバーライドします。
   * - 与えられた引数は無視され、`companiInfo` を docId とするドキュメントのインスタンスを返します。
   * @returns {Promise<Object|null>} - 取得されたドキュメントデータが返されます。ドキュメントが存在しない場合は`null`が返されます。
   */
  async fetchDoc() {
    return await super.fetchDoc(`companyInfo`)
  }

  /**
   * subscribe をオーバーライドします。
   * - 与えられた引数は無視され、`companiInfo` を docId とするドキュメントが読み込まれます。
   * @returns {void}
   */
  subscribe() {
    super.subscribe(`companyInfo`)
  }

  // delete, fetchDocs, restore, subscribeDocs は使用不可
  delete() {
    return Promise.reject(new Error('このクラスの delete は使用できません。'))
  }

  deleteAll() {
    return Promise.reject(
      new Error('このクラスの deleteAll は使用できません。')
    )
  }

  fetchDocs() {
    return Promise.reject(
      new Error('このクラスの fetchDocs は使用できません。')
    )
  }

  restore() {
    return Promise.reject(new Error('このクラスの restore は使用できません。'))
  }

  subscribeDocs() {
    return Promise.reject(
      new Error('このクラスの subscribeDocs は使用できません。')
    )
  }
}
