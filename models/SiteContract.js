import { FireModel } from 'air-firebase'
import { where } from 'firebase/firestore'
import Site from './Site'
import { classProps } from './propsDefinition/SiteContract'

/**
 * ## SiteContractsドキュメントデータモデル【物理削除】
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class SiteContract extends FireModel {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item, 'SiteContracts', [], false, [], classProps)
    Object.defineProperties(this, {
      workMinutes: {
        enumerable: true,
        get() {
          if (!this.startDate) return 0
          if (!this.startTime || !this.endTime) return 0
          const start = new Date(`${this.startDate} ${this.startTime}`)
          const end = new Date(`${this.startDate} ${this.endTime}`)
          if (this.endTimeNextday) end.setDate(end.getDate() + 1)
          const diff = (end.getTime() - start.getTime()) / 60 / 1000
          return diff - (this.breakMinutes || 0)
        },
        set(v) {},
      },
    })
  }

  /****************************************************************************
   * クラスインスタンスをオブジェクト形式に変換します。
   * - スーパークラスの `toObject` メソッドを呼び出し、その結果に `site` プロパティを追加します。
   * - `site` プロパティが存在し、かつ `toObject` メソッドを持つ場合、そのメソッドを呼び出してオブジェクトに変換します。
   * - `site` が存在しない場合、もしくは `toObject` メソッドを持たない場合、そのままの値か、空のオブジェクトを返します。
   *
   * @returns {Object} - クラスインスタンスを表すオブジェクト
   ****************************************************************************/
  toObject() {
    return {
      ...super.toObject(),
      site:
        this.site && typeof this.site.toObject === 'function'
          ? this.site.toObject()
          : this.site || {},
    }
  }

  /****************************************************************************
   * Firestoreから取得したデータをクラスインスタンスに変換します。
   * - スーパークラスの `fromFirestore` メソッドを呼び出して基本のインスタンスを取得します。
   * - 取得した `site` データを新しい `Site` クラスのインスタンスに変換します。
   * - `site` が存在しない場合、`null` を引数として渡して `Site` のインスタンスを作成します。
   *
   * @param {Object} snapshot - Firestoreから取得したドキュメントスナップショット
   * @returns {Object} - クラスインスタンス
   ****************************************************************************/
  fromFirestore(snapshot) {
    // スーパークラスから基本のインスタンスを生成
    const instance = super.fromFirestore(snapshot)
    // site データを新しい Site クラスのインスタンスに変換
    instance.site = new Site(instance.site)
    // 変換したインスタンスを返す
    return instance
  }

  /****************************************************************************
   * beforeCreateをオーバーライドします。
   * - 同一の現場、開始日、勤務区分での取極めが存在する場合は作成不可です。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeCreate() {
    if (!this.siteId) {
      throw new Error('現場の指定が必要です。')
    }
    if (!this.startDate) {
      throw new Error('開始日の指定が必要です。')
    }
    if (!this.workShift) {
      throw new Error('勤務区分の指定が必要です。')
    }
    const id = `${this.siteId}-${this.startDate}-${this.workShift}`
    const existingContract = await this.fetchDoc(id)
    if (existingContract) {
      throw new Error('同一の取極めが既に登録されています。')
    }
    try {
      const site = await new Site().fetchDoc(this.siteId)
      if (!site) {
        throw new Error('現場情報が取得できませんでした。')
      }
      this.site = site
      await super.beforeCreate()
    } catch (err) {
      // eslint-disable-next-line
      console.error(
        `[SiteContract.js beforeCreate] Error fetching site: ${err.message}`
      )
      throw err
    }
  }

  /****************************************************************************
   * beforeUpdateをオーバーライドします。
   * - 現場、開始日、勤務区分が変更されていないか確認します。
   * @returns {Promise<void>} - 成功すると解決されるPromise
   * @throws {Error} - 現場、開始日、勤務区分が変更されている場合にエラーをスローします。
   ****************************************************************************/
  async beforeUpdate() {
    // 正規表現を使用して、siteId, startDate, workShiftを抽出
    const match = this.docId.match(/^([^-]+)-(\d{4}-\d{2}-\d{2})-([^-]+)$/)
    const [, siteId, startDate, workShift] = match

    if (
      siteId !== this.siteId ||
      startDate !== this.startDate ||
      workShift !== this.workShift
    ) {
      throw new Error('現場、開始日、勤務区分は変更できません。')
    }

    // 親クラスの beforeUpdate メソッドを呼び出す
    await super.beforeUpdate()
  }

  /****************************************************************************
   * createメソッドをオーバーライドします。
   * `docId`を`${siteId}-${startDate}-${workShift}`に固定します。
   * - 生成した`docId`を使用して親クラスのcreateメソッドを呼び出します。
   *
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   * @throws {Error} ドキュメント作成中にエラーが発生した場合にエラーをスローします
   ****************************************************************************/
  async create() {
    try {
      // `docId`を`${siteId}-${startDate}-${workShift}`の形式で生成
      const docId = `${this.siteId}-${this.startDate}-${this.workShift}`

      // 親クラスのcreateメソッドを`docId`を渡して呼び出し
      await super.create({ docId })
    } catch (err) {
      // エラーハンドリング：エラーメッセージを出力し、エラーを再スロー
      // eslint-disable-next-line no-console
      console.error(`[create] Failed to create document: ${err.message}`, {
        err,
      })

      // エラーを再スローして呼び出し元に通知
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
  async fetchBySiteIds(ids) {
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
        const constraints = [where('siteId', 'in', arr)]
        return await this.fetchDocs(constraints)
      })

      // すべてのクエリ結果が解決されるまで待機
      const snapshots = await Promise.all(promises)

      // 各クエリ結果をフラットにまとめて返す
      return snapshots.flat()
    } catch (err) {
      // エラーハンドリング：エラーメッセージを出力し、エラーを再スロー
      // eslint-disable-next-line no-console
      console.error(
        `[fetchBySiteIds] Error fetching documents: ${err.message}`,
        { err }
      )

      // エラーを再スローして呼び出し元に通知
      throw err
    }
  }
}
