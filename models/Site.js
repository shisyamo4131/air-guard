import { database, FireModel } from 'air-firebase'
import { get, ref } from 'firebase/database'
import { CustomerMinimal } from './Customer'
import { classProps } from './propsDefinition/Site'

/**
 * 現場ドキュメントデータモデル【論理削除】
 * @author shisyamo4131
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
    customer: CustomerMinimal,
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
      // const customer = await new Customer().fetchDoc(this.customerId)
      // if (!customer) {
      //   throw new Error('取引先情報が取得できませんでした。')
      // }
      // this.customer = customer
      await this.customer.fetch(this.customerId)
      if (!this.customer.docId) {
        throw new Error('取引先情報が取得できませんでした。')
      }
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
        // const customer = await new Customer().fetchDoc(this.customerId)
        // if (!customer) {
        //   throw new Error('取引先情報が取得できませんでした。')
        // }
        // this.customer = customer
        await this.customer.fetch(this.customerId)
        if (!this.customer.docId) {
          throw new Error('取引先情報が取得できませんでした。')
        }
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
   * beforeDeleteをオーバーライドします。
   * - 配置管理で使用されている場合はエラーを返します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   * @throws {Error} - 配置管理で使用されている場合にエラーをスローします。
   ****************************************************************************/
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
   *
   * 2024-11-14 - 同期設定がなされたもののみを返すように変更
   * -> 稼働実績の取り込み時に、スポット登録された現場があると CODE 重複で意図しない
   *    マスタと紐づけられてしまう為。
   *
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

  /****************************************************************************
   * 指定された複数の`siteId`に該当するドキュメントを取得します。
   * - 30件ずつチャンクに分けてFirestoreにクエリを実行します。
   * - 各クエリ結果をまとめて返します。
   *
   * @param {Array<string>} ids - 取得対象のsiteIdsの配列
   * @returns {Promise<Array>} - 一致するドキュメントの配列を返すPromise
   * @throws {Error} ドキュメント取得中にエラーが発生した場合にエラーをスローします
   ****************************************************************************/
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

/**
 * Site クラスから createAt, updateAt, uid, remarks, tokenMap を削除したクラスです。
 * - 非正規化した site プロパティを持つドキュメントに保存するデータを提供するためのクラス
 * - 不要なプロパティを削除することでデータ量を抑制するために使用します。
 * - 更新系のメソッドは利用できません。
 */
export class SiteMinimal extends Site {
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
