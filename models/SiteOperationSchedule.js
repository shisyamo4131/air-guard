/*****************************************************************************
 * カスタムクラス定義: 現場稼働予定 - SiteOperationSchedule -
 *
 * @author shisyamo4131
 * @refact 2025-02-06
 *****************************************************************************/
import { runTransaction } from 'firebase/firestore'
import { FireModel, firestore } from 'air-firebase'
import { generateProps } from './propsDefinition/propsUtil'
import { SiteMinimal } from './Site'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 日付
  date: { type: String, default: '', required: false, requiredByClass: true },

  /**
   * スケジュールの一括登録で使用するプロパティ。
   */
  dates: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },

  // 現場ID
  siteId: { type: String, default: '', required: false, requiredByClass: true },

  // 現場オブジェクト
  site: {
    type: Object,
    default: () => new SiteMinimal(),
    required: false,
  },

  // 勤務区分
  workShift: {
    type: String,
    default: 'day',
    validator: (v) => ['day', 'night'].includes(v),
    required: false,
    requiredByClass: true,
  },

  // 開始時刻
  startTime: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 終了時刻
  endTime: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 必要人数
  requiredWorkers: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: true,
  },

  // 要資格者フラグ
  qualification: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // 備考
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 休工フラグ（true で休工）
  isClosed: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
}

const { vueProps, classProps } = generateProps(propsDefinition)

export { vueProps }

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class SiteOperationSchedule extends FireModel {
  // FireModel 設定
  static collectionPath = 'SiteOperationSchedules'
  static useAutonumber = false
  static logicalDelete = false
  static classProps = classProps
  static tokenFields = []
  static hasMany = []

  /**
   * beforeCreateをオーバーライドします。
   * - 同一の現場、日付、勤務区分での稼働予定が存在する場合は作成不可です。
   * - 休工フラグが true の場合、必要人数を強制的に 0 にします。
   * - site プロパティに現場ドキュメントを読み込みます。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   */
  async beforeCreate() {
    if (!this.siteId) throw new Error('現場の指定が必要です。')
    if (!this.date) throw new Error('日付の指定が必要です。')
    if (!this.workShift) throw new Error('勤務区分の指定が必要です。')

    if (this.isClosed) this.requiredWorkers = 0

    /**
     * 一括作成（bulkCreate）の際、beforeCreate が複数回コールされるため
     * 現場ドキュメントの無駄な読み込みが発生します。
     * これを避けるため、siteId と site.docId を比較し、異なるときにのみ
     * 現場ドキュメントを読み込むようにしています。
     */
    if (this.siteId !== this.site.docId) {
      await this.site.fetch(this.siteId)
    }

    await super.beforeCreate()
  }

  /**
   * beforeUpdateをオーバーライドします。
   * - 現場、日付、勤務区分が変更されていないか確認します。
   * @returns {Promise<void>} - 成功すると解決されるPromise
   * @throws {Error} - 現場、日付、勤務区分が変更されている場合にエラーをスローします。
   */
  async beforeUpdate() {
    // 現場ID、日付、勤務区分の変更は不可
    const { siteId, date, workShift } = this._beforeData
    if (
      this.siteId !== siteId ||
      this.date !== date ||
      this.workShift !== workShift
    ) {
      throw new Error('現場、日付、勤務区分は変更できません。')
    }

    // 休工フラグが true であれば必要人数は強制的に 0 とする
    if (this.isClosed) this.requiredWorkers = 0

    await super.beforeUpdate()
  }

  /**
   * createメソッドをオーバーライドします。
   * - `docId`は`${siteId}-${date}-${workShift}`に固定されます。
   * - bulk オプションが true の場合は `dates` プロパティに保存されているすべての日付について一括で作成します。（既定値: true）
   * - bulk オプションが false の場合は親クラスのcreateメソッドを呼び出します。
   * @param {Object} options
   * @param {boolean} [options.bulk=true] - true の場合、複数のドキュメントを一括作成します。
   * @param {boolean} [options.overRide=false] - true の場合、既存のドキュメントが存在しても上書きされます。
   * @param {Object} [options.transaction=null] - Firestore のトランザクションオブジェクト（オプション）
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   * @throws {Error} ドキュメント作成中にエラーが発生した場合にエラーをスローします
   */
  async create({ bulk = true, overRide = false, transaction = null } = {}) {
    try {
      if (bulk) {
        await this._bulkCreate({ transaction })
      } else {
        // docId を固定
        const docId = `${this.siteId}-${this.date}-${this.workShift}`

        // ドキュメントが既に存在する場合はエラー
        if (!overRide) {
          const isExist = await this.fetchDoc(docId)
          if (isExist) {
            const message = `[create] 既に存在する現場稼働予定です。`
            throw new Error(message)
          }
        }

        await super.create({ docId, transaction })
      }
    } catch (err) {
      const message = `[create] 現場稼働予定の作成処理でエラーが発生しました。: ${err.message}`
      // eslint-disable-next-line no-console
      console.error(message, { err })
      throw err
    }
  }

  /**
   * [PRIVATE]
   * dates プロパティを参照し、指定された複数（または単一）の日付の現場稼働予定ドキュメントを作成します。
   * @param {Object} options
   * @param {boolean} [options.overRide=false] - true の場合、既存のドキュメントが存在しても上書きされます。
   * @param {Object} [options.transaction=null] - Firestore のトランザクションオブジェクト（オプション）
   */
  async _bulkCreate({ overRide = false, transaction = null } = {}) {
    // 一括作成用である dates プロパティをチェック
    if (!Array.isArray(this.dates) || !this.dates.length) {
      throw new Error('[_bulkCreate] 日付が選択されていません。')
    }

    if (!overRide) {
      // 作成するドキュメントの ID を配列に用意
      const docIds = this.dates.map((date) => {
        return `${this.siteId}-${date}-${this.workShift}`
      })

      // 既に存在するドキュメントがある場合はエラー
      const existDocuments = await Promise.all(
        docIds.map((docId) => this.fetchDoc(docId))
      )
      if (existDocuments.some((doc) => doc)) {
        const message = `[_bulkCreate] 既に稼働予定が登録されている日付が含まれています。`
        throw new Error(message, { existDocuments })
      }
    }

    // トランザクション処理を行う関数
    const transactionHandler = async (txn) => {
      for (const date of this.dates) {
        const docId = `${this.siteId}-${date}-${this.workShift}`
        this.date = date
        await super.create({ docId, txn })
      }
    }

    try {
      if (transaction) {
        await transactionHandler(transaction)
      } else {
        await runTransaction(firestore, transactionHandler)
      }
    } catch (err) {
      const message = `[_bulkCreate] 現場稼働予定の一括作成処理でエラーが発生しました。: ${err.message}`
      // eslint-disable-next-line no-console
      console.error(message, { err })
      throw err
    }
  }

  /**
   * from で指定された現場IDの稼働予定ドキュメントを to で指定された現場IDの
   * 稼働予定として登録します。
   * - 既に存在する現場稼働予定は上書きされます。
   * - from の稼働予定はすべて削除されます。
   * @param {Object} options
   * @param {string} options.from - 統合元の現場ID
   * @param {string} options.to - 統合先の現場ID
   */
  static async integrate({ from, to } = {}) {
    const instance = new this()
    try {
      // 統合元のドキュメントを取得
      const sourceDocs = await instance.fetchDocs([
        ['where', 'siteId', '==', from],
      ])

      if (!sourceDocs || sourceDocs.length === 0) {
        // eslint-disable-next-line no-console
        console.warn(`No documents found for siteId: ${from}`)
        return
      }

      // トランザクションの実行
      await runTransaction(firestore, async (transaction) => {
        const promises = []
        for (const doc of sourceDocs) {
          // 新しいインスタンスを作成
          const newDocData = { ...doc, siteId: to }
          const newInstance = new this(newDocData)

          // 新しいドキュメントを作成
          promises.push(
            newInstance.create({ bulk: false, overRide: true, transaction })
          )

          // 元のドキュメントを削除
          promises.push(doc.delete({ transaction }))
        }
        await Promise.all(promises)
      })

      // eslint-disable-next-line no-console
      console.log(`Documents successfully integrated from ${from} to ${to}`)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        `Failed to integrate documents from ${from} to ${to}`,
        error
      )
      throw new Error('Integration failed')
    }
  }
}

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class SiteOperationScheduleMinimal extends SiteOperationSchedule {
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
