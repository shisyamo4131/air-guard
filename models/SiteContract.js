import { FireModel } from 'air-firebase'
import Site from './Site'
import { classProps } from './propsDefinition/SiteContract'
import { isValidDateFormat } from '~/utils/utility'

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
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    site: Site,
  }

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
      return await super.create({ docId })
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
        const constraints = [['where', 'siteId', 'in', arr]]
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

  /****************************************************************************
   * 指定されたsiteId、日付、勤務区分に基づいて契約情報を取得し、自身を初期化します。
   * - 指定された条件で最も新しい契約情報を1件取得します。
   *
   * @param {Object} params - siteId、date、workShiftを含むオブジェクト
   * @param {string} params.siteId - 契約情報を取得する現場のID
   * @param {string} params.date - 検索する日付（YYYY-MM-DD形式）
   * @param {string} params.workShift - 勤務区分 ('day' または 'night')
   * @returns {Promise<void>} - 処理が成功した場合はPromiseを返す
   * @throws {Error} - siteId、日付、または勤務区分が不正な場合にエラーをスローします
   ****************************************************************************/
  async loadContract({ siteId, date, workShift }) {
    // siteIdが指定されているかを確認
    if (!siteId) {
      throw new Error('[loadContract] "siteId" is required.')
    }

    // 日付が正しいフォーマットかを確認
    if (!isValidDateFormat(date)) {
      throw new Error('[loadContract] "date" must be in YYYY-MM-DD format.')
    }

    // 勤務区分が適切に指定されているかを確認
    if (!workShift || (workShift !== 'day' && workShift !== 'night')) {
      throw new Error(
        '[loadContract] "workShift" must be either "day" or "night".'
      )
    }

    try {
      // 指定された条件に基づいて契約情報を取得
      const contracts = await this.fetchDocs([
        ['where', 'siteId', '==', siteId],
        ['where', 'startDate', '<=', date],
        ['where', 'workShift', '==', workShift],
        ['orderBy', 'startDate', 'desc'],
        ['limit', 1],
      ])

      // 契約情報が存在しない場合は警告を出力し、インスタンスを初期化
      if (!contracts.length) {
        // eslint-disable-next-line no-console
        console.warn(
          `[loadContract] No contract found for siteId: ${siteId}, date: ${date}, workShift: ${workShift}.`
        )
        this.initialize()
        return
      }

      // 契約情報でインスタンスを初期化
      this.initialize(contracts[0])
    } catch (err) {
      // エラーハンドリング: エラーの詳細をログに出力
      // eslint-disable-next-line no-console
      console.error(`[loadContract] Failed to fetch contracts: ${err.message}`)
      throw new Error(
        `[loadContract] Error fetching contract for siteId: ${siteId}, date: ${date}, workShift: ${workShift}.`
      )
    }
  }
}
