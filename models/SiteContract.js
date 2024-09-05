import { FireModel } from 'air-firebase'
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
    const id = `${this.siteId}-${this.startDate}-${this.workShit}`
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
    const [siteId, startDate, workShift] = this.docId.split('-')

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
   * createをオーバーライドします。
   * `docId`を`${siteId}-${startDate}-${workShift}`に固定します。
   * - super.create({docId})を呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async create() {
    const docId = `${this.siteId}-${this.startDate}-${this.workShift}`
    await super.create({ docId })
  }
}
