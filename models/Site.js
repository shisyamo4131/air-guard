/*****************************************************************************
 * カスタムクラス定義: 現場 - Site -
 *
 * @author shisyamo4131
 * @refact 2025-02-04
 *****************************************************************************/
import { database, FireModel } from 'air-firebase'
import { get, ref } from 'firebase/database'
import { CustomerMinimal } from './Customer'
import { SECURITY_TYPE } from './constants/security-types'
import { SITE_STATUS } from './constants/site-status'
import { generateProps } from './propsDefinition/propsUtil'
import { fetchCoordinates } from '~/utils/geocode'

/**
 * PROPERTIES
 */
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 取引先ID
  customerId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 取引先ドキュメント
  customer: {
    type: Object,
    default: null,
    required: false,
    validator: (v) => v instanceof CustomerMinimal,
    requiredByClass: true,
  },

  // 現場code
  code: { type: String, default: '', required: false, requiredByClass: false },

  // 現場名
  name: { type: String, default: '', required: false, requiredByClass: true },

  // 現場名略称
  abbr: { type: String, default: '', required: false, requiredByClass: true },

  // 現場名略称カナ
  abbrKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 略称コード（取引先から指定された現場のコードなど）
  abbrNumber: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 住所
  address: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 開始日
  startAt: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 終了日
  endAt: { type: String, default: '', required: false, requiredByClass: false },

  // 警備種別
  securityType: {
    type: String,
    default: '',
    required: false,
    validator: (v) => !v || Object.keys(SECURITY_TYPE).includes(v),
    requiredByClass: true,
  },

  // 状態
  status: {
    type: String,
    default: 'active',
    required: false,
    validator: (v) => Object.keys(SITE_STATUS).includes(v),
    requiredByClass: true,
  },

  // 備考
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // お気に入りフラグ
  favorite: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // 同期状態
  sync: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // スポット現場フラグ
  isSpot: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // 現場取極め存在フラグ
  hasContract: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  location: {
    type: Object,
    default: () => {
      return {
        formattedAddress: null,
        lat: null,
        lng: null,
      }
    },
    required: false,
  },
}

const { vueProps, classProps } = generateProps(propsDefinition)
export { vueProps }

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class Site extends FireModel {
  // FireModel 設定
  static collectionPath = 'Sites'
  static useAutonumber = true
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['abbr', 'abbrKana']
  static hasMany = [
    {
      collection: 'OperationResults',
      field: 'siteId',
      condition: '==',
      type: 'collection',
    },
  ]

  // カスタムクラスマップ
  static customClassMap = { customer: CustomerMinimal }

  /**
   * customerId をもとに customer プロパティを更新します。
   * @returns {Promise<void>}
   * @throws {Error} - customerId が設定されていない場合にエラーをスローします。
   * @throws {Error} - customerId に該当する取引先ドキュメントが存在しない場合にエラーをスローします。
   */
  async #reloadCustomer() {
    // customerId が設定されていなければエラーをスロー
    if (!this.customerId) {
      throw new Error('customerId が設定されていません。')
    }

    // 取引先ドキュメントをフェッチして customer プロパティにセット
    const isFetched = await this.customer.fetch(this.customerId)

    // フェッチの結果が false であればエラーをスロー
    if (!isFetched) throw new Error('取引先情報が取得できませんでした。')
  }

  /**
   * 作成直前の処理です。
   * - customerId をもとに customer プロパティを更新します。
   * @returns {Promise<void>}
   * @throws {Error} - customer プロパティの更新に失敗した場合、エラーをスローします。
   */
  async beforeCreate() {
    try {
      // customer プロパティを設定
      await this.#reloadCustomer()

      // 座標情報を取得して設定
      this.location = await fetchCoordinates(this.address)

      await super.beforeCreate()
    } catch (err) {
      // eslint-disable-next-line
      console.error(`[beforeCreate] ${err.message}`)
      throw err
    }
  }

  /**
   * 更新直前の処理です。
   * - customerId が変更されていた場合、customer プロパティを更新します。
   * - 住所が変更されていた場合、または座標情報が設定されていない場合は座標情報を更新します。
   * @returns {Promise<void>}
   * @throws {Error} - customer プロパティの更新に失敗した場合、エラーをスローします。
   * @throws {Error} - 座標情報の更新処理に失敗した場合、エラーをスローします。
   */
  async beforeUpdate() {
    try {
      // 取引先が変更されていれば、customer プロパティを更新
      if (this.customerId !== this._beforeData.customerId) {
        await this.#reloadCustomer()
      }

      // 住所が変更されている、または座標情報が取得できていなければ座標情報を更新
      if (
        this.address !== this._beforeData.address ||
        !this.location?.lat ||
        !this.location?.lng
      ) {
        this.location = await fetchCoordinates(this.address)
      }

      super.beforeUpdate()
    } catch (err) {
      // eslint-disable-next-line
      console.error(`[beforeUpdate] ${err.message}`)
      throw err
    }
  }

  /**
   * 削除直前の処理です。
   * - 配置管理で使用されている現場であった場合は削除できないようにします。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   * @throws {Error} - 配置管理で使用されている場合にエラーをスローします。
   */
  async beforeDelete() {
    try {
      const dbRef = ref(database, `/Placements/siteOrder`)
      const snapshot = await get(dbRef)
      if (snapshot.exists() && snapshot.val().includes(this.docId)) {
        throw new Error(`配置管理で使用されているため削除できません。`)
      }
      await super.beforeDelete()
    } catch (err) {
      // eslint-disable-next-line
      console.error(
        `[Site.js beforeDelete] Error fetching siteOrder.: ${err.message}`
      )
      throw err
    }
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

  /**
   * 現場codeの配列を受け取り、該当する現場ドキュメントデータを配列で返します。
   * 現場codeの配列は、重複があれば一意に整理されます。
   *
   * 2024-11-14 - 同期設定がなされたもののみを返すように変更
   * -> 稼働実績の取り込み時に、スポット登録された現場があると CODE 重複で意図しない
   *    マスタと紐づけられてしまう為。
   *
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
        const constraints = [['where', 'code', 'in', arr]]
        return await this.fetchDocs(constraints)
      })
      const snapshots = await Promise.all(promises)
      // return snapshots.flat()
      return snapshots.flat().filter((item) => item.sync)
    } catch (err) {
      // eslint-disable-next-line
      console.error(
        `[Site.js fetchByCodes] Error fetching documents: ${err.message}`
      )
      throw err
    }
  }

  /**
   * 指定された複数の`siteId`に該当するドキュメントを取得します。
   * - 30件ずつチャンクに分けてFirestoreにクエリを実行します。
   * - 各クエリ結果をまとめて返します。
   *
   * @param {Array<string>} ids - 取得対象のsiteIdsの配列
   * @returns {Promise<Array>} - 一致するドキュメントの配列を返すPromise
   * @throws {Error} ドキュメント取得中にエラーが発生した場合にエラーをスローします
   */
  async fetchByIds(ids) {
    // 引数が配列でない、または空の場合は空配列を返す
    if (!Array.isArray(ids) || ids.length === 0) return []

    try {
      // 重複を排除した`ids`を取得
      const unique = [...new Set(ids)]

      // `unique`配列を30件ずつのチャンクに分割
      const chunked = unique.flatMap((_, i) =>
        i % 30 ? [] : [unique.slice(i, i + 30)]
      )

      // 各チャンクに対してFirestoreクエリを実行し、ドキュメントを取得
      const promises = chunked.map(async (arr) => {
        const constraints = [['where', 'docId', 'in', arr]]
        return await this.fetchDocs(constraints)
      })

      // すべてのクエリ結果が解決されるまで待機
      const snapshots = await Promise.all(promises)

      // 各クエリ結果をフラットにまとめて返す
      return snapshots.flat()
    } catch (err) {
      // エラーハンドリング：エラーメッセージを出力し、エラーを再スロー
      // eslint-disable-next-line no-console
      console.error(`[fetchByIds] Error fetching documents: ${err.message}`, {
        err,
      })

      // エラーを再スローして呼び出し元に通知
      throw err
    }
  }
}

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class SiteMinimal extends Site {
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
