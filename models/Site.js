import { FireModel } from 'air-firebase'
import Customer from './Customer'
import { classProps } from './propsDefinition/Site'
import SiteContract from './SiteContract'
import SiteOperationSchedule from './SiteOperationSchedule'
import { isValidDateFormat } from '~/utils/utility'

/**
 * ## Sitesドキュメントデータモデル【論理削除】
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class Site extends FireModel {
  #SiteContractInstance = new SiteContract()
  #SiteOperationScheduleInstance = new SiteOperationSchedule()
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

  /****************************************************************************
   * 現場の取極めに対して、Firestoreコレクションのリアルタイムリスナーを設定します。
   * - SiteContractクラスを使用し、当該現場の取極めドキュメントに対するリアルタイム監視を開始します。
   * - docIdが設定されていない場合、エラーメッセージを出力して処理を中断します。
   *
   * @returns {Array<Object>|undefined} リアルタイムで監視しているデータ
   ****************************************************************************/
  subscribeContracts() {
    try {
      // docIdが設定されているか確認
      if (!this.docId) {
        throw new Error(`[Site.js - subscribeContracts]: docId is not set.`)
      }

      // SiteContractクラスを使用して、当該現場の取極めドキュメントに対するリアルタイムリスナーを設定
      return this.#SiteContractInstance.subscribeDocs([
        ['where', 'siteId', '==', this.docId],
      ])
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err.message)
      return []
    }
  }

  /****************************************************************************
   * 現場の取極めドキュメントに対するリアルタイムリスナーを解除します。
   * - SiteContractクラスで設定されているFirestoreのリアルタイムリスナーを解除します。
   ****************************************************************************/
  unsubscribeContracts() {
    try {
      if (this.#SiteContractInstance) {
        this.#SiteContractInstance.unsubscribe()
        // eslint-disable-next-line no-console
        console.info(
          `[Site.js - unsubscribeContracts]: Listener successfully unsubscribed.`
        )
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          `[Site.js - unsubscribeContracts]: No active listener found.`
        )
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        `[Site.js - unsubscribeContracts]: Error during listener unsubscribe: ${err.message}`,
        { err }
      )
    }
  }

  /****************************************************************************
   * 現場の稼働予定に対して、Firestoreコレクションのリアルタイムリスナーを設定します。
   * - SiteOperationScheduleクラスを使用し、当該現場の稼働予定ドキュメントに対するリアルタイム監視を開始します。
   * - docIdが設定されていない場合、エラーメッセージを出力して処理を中断します。
   *
   * @param {Object} param0 - fromとtoの日付範囲を持つオブジェクト
   * @param {string} param0.from - 開始日 (YYYY-MM-DD形式)
   * @param {string} param0.to - 終了日 (YYYY-MM-DD形式)
   * @returns {Array<Object>|undefined} リアルタイムで監視しているデータ
   ****************************************************************************/
  subscribeSchedules({ from, to }) {
    try {
      // docIdが設定されているか確認
      if (!this.docId) {
        throw new Error(`[Site.js - subscribeSchedules]: docId is not set.`)
      }

      // from、toがYYYY-MM-DD形式の日付であることを確認
      if (!isValidDateFormat(from) || !isValidDateFormat(to)) {
        throw new Error(
          `[Site.js - subscribeSchedules]: 'from' and 'to' must be valid dates in 'YYYY-MM-DD' format.`
        )
      }

      // SiteOperationScheduleクラスを使用して、当該現場の稼働予定ドキュメントに対するリアルタイムリスナーを設定
      return this.#SiteOperationScheduleInstance.subscribeDocs([
        ['where', 'siteId', '==', this.docId],
        ['where', 'date', '>=', from],
        ['where', 'date', '<=', to],
      ])
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err.message, { from, to })
      return []
    }
  }

  /****************************************************************************
   * 現場の稼働予定ドキュメントに対するリアルタイムリスナーを解除します。
   * - SiteOperationScheduleクラスで設定されているFirestoreのリアルタイムリスナーを解除します。
   ****************************************************************************/
  unsubscribeSchedules() {
    try {
      if (this.#SiteOperationScheduleInstance) {
        this.#SiteOperationScheduleInstance.unsubscribe()
        // eslint-disable-next-line no-console
        console.info(
          `[Site.js - unsubscribeSchedules]: Listener successfully unsubscribed.`
        )
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          `[Site.js - unsubscribeSchedules]: No active listener found.`
        )
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        `[Site.js - unsubscribeSchedules]: Error during listener unsubscribe: ${err.message}`,
        { err }
      )
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
