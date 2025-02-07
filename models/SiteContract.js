/*****************************************************************************
 * カスタムクラス定義: 現場取極め - SiteContract -
 *
 * @author shisyamo4131
 * @refact 2025-02-07
 *****************************************************************************/
import dayjs from 'dayjs'
import { FireModel } from 'air-firebase'
import { SiteMinimal } from './Site'
import { WORK_SHIFT } from './constants/work-shifts'
import { generateProps } from './propsDefinition/propsUtil'
import { isValidDateFormat } from '~/utils/utility'

/*****************************************************************************
 * クラス定義: 金額 - Price -
 * - 単価情報を管理するためのプロパティを提供するクラスです。
 *****************************************************************************/
class Price {
  constructor(item = {}) {
    this.initialize(item)
  }

  initialize(item = {}) {
    // 単価
    this.price = typeof item.price === 'number' ? item.price : 0

    // 残業単価
    this.overtime = typeof item.overtime === 'number' ? item.overtime : 0
  }

  toObject() {
    return { ...this }
  }
}

/*****************************************************************************
 * クラス定義: 単価 - UnitPrice -
 * - 資格あり、資格なし単価情報のためのプロパティを提供するクラスです。
 *****************************************************************************/
class UnitPrice {
  constructor(item = {}) {
    this.initialize(item)
  }

  initialize(item = {}) {
    // 資格なし
    this.standard = new Price(item.standard || {})

    // 資格あり
    this.qualified = new Price(item.qualified || {})
  }

  toObject() {
    return {
      standard: this.standard.toObject(),
      qualified: this.qualified.toObject(),
    }
  }
}

/*****************************************************************************
 * クラス定義: 曜日区分別単価 - UnitPrices -
 * - 曜日区分別単価情報のためのプロパティを提供するクラスです。
 * - SiteContract クラスで直接的に使用されるクラスオブジェクトになります。
 *****************************************************************************/
class UnitPrices {
  constructor(item = {}) {
    this.initialize(item)
  }

  initialize(item = {}) {
    // 平日
    this.weekdays = new UnitPrice(item.weekdays || {})

    // 土曜
    this.saturday = new UnitPrice(item.saturday || {})

    // 日曜
    this.sunday = new UnitPrice(item.sunday || {})

    // 祝日
    this.holiday = new UnitPrice(item.holiday || {})
  }

  toObject() {
    return {
      weekdays: this.weekdays.toObject(),
      saturday: this.saturday.toObject(),
      sunday: this.sunday.toObject(),
      holiday: this.holiday.toObject(),
    }
  }
}

// UnitPrices クラスを vue コンポーネントが使用できるようにエクスポート
export { UnitPrices }

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false, requiredByClass: false },

  // 現場ID
  siteId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 現場オブジェクト
  site: {
    type: Object,
    default: () => new SiteMinimal(),
    required: false,
    requiredByClass: true,
  },

  // 開始日
  startDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 勤務区分
  workShift: {
    type: String,
    default: 'day',
    validator: (v) => Object.keys(WORK_SHIFT).includes(v),
    required: false,
    requiredByClass: true,
  },

  // 開始時刻
  startTime: {
    type: String,
    default: '08:00',
    required: false,
    requiredByClass: true,
  },

  // 終了時刻
  endTime: {
    type: String,
    default: '17:00',
    required: false,
    requiredByClass: true,
  },

  // 翌日終了フラグ
  endAtNextday: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // 休憩時間（分）
  breakMinutes: {
    type: Number,
    default: 60,
    required: false,
    requiredByClass: true,
  },

  // 実働時間（分）
  workMinutes: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: true,
  },

  // 曜日区分別単価情報
  unitPrices: {
    type: Object,
    default: () => new UnitPrices(),
    required: false,
    requiredByClass: false,
  },

  // 半勤時請求レート
  halfRate: {
    type: Number,
    default: 50,
    required: false,
    requiredByClass: true,
  },

  // 中止時請求レート
  cancelRate: {
    type: Number,
    default: 100,
    required: false,
    requiredByClass: true,
  },

  // 備考
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
}

const { vueProps, classProps } = generateProps(propsDefinition)
export { vueProps }

/**
 * ACCESSOR
 */
const accessor = {
  /**
   * 実働時間を開始時刻、終了時刻から計算して返します。
   * - 勤務日、開始時刻、終了時刻、休憩時間が未入力の場合は 0 を返します。
   */
  workMinutes: {
    configurable: true,
    enumerable: true,
    get() {
      // 勤務日、開始時刻、終了時刻が未入力であれば 0 を返す
      if (!this.startDate) return 0
      if (!this.startTime || !this.endTime) return 0

      // 休憩時間が数値でなければ 0 を返す
      if (typeof this.breakMinutes !== 'number') return 0

      // 開始時刻、終了時刻から dayjs オブジェクトを生成
      const from = dayjs(`${this.startDate} ${this.startTime}`)
      let to = dayjs(`${this.startDate} ${this.endTime}`)
      if (this.endAtNextday) to = to.add(1, 'day') // 翌日終了フラグによる日の加算

      // 時間差（分）を算出し、休憩時間を差し引く
      const total = to.diff(from, 'minute') - this.breakMinutes

      // 0 と計算結果とを比較して小さい方を返す
      return Math.max(0, total)
    },
    set(v) {},
  },
}

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class SiteContract extends FireModel {
  // FireModel 設定
  static collectionPath = 'SiteContracts'
  static useAutonumber = false
  static logicalDelete = false
  static classProps = classProps
  static tokenFields = []
  static hasMany = [
    {
      collection: 'OperationResults',
      field: 'siteContractId',
      condition: '==',
      type: 'collection',
    },
  ]

  // カスタムクラスマップ
  static customClassMap = { site: SiteMinimal }

  // initialize をオーバーライドし、アクセサーを設定
  initialize(item = {}) {
    super.initialize(item)
    Object.defineProperties(this, {
      // workMinutes を自動計算にする。
      workMinutes: accessor.workMinutes,
    })
  }

  /**
   * beforeCreateをオーバーライドします。
   * - 同一の現場、開始日、勤務区分での取極めが存在する場合は作成不可です。
   * - 現場オブジェクトを取得して自身のプロパティにセットします。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   */
  async beforeCreate() {
    // 必須プロパティの確認
    const missingFields = []
    if (!this.siteId) missingFields.push('現場の指定')
    if (!this.startDate) missingFields.push('開始日の指定')
    if (!this.workShift) missingFields.push('勤務区分の指定')

    // 必須プロパティが不足していた場合、エラーをスロー
    if (missingFields.length > 0) {
      throw new Error(`${missingFields.join('、')}が必要です。`)
    }

    const id = `${this.siteId}-${this.startDate}-${this.workShift}`

    try {
      const existingContract = await this.fetchDoc(id)
      if (existingContract) {
        throw new Error('同一の取極めが既に登録されています。')
      }

      await this.site.fetch(this.siteId)

      await super.beforeCreate()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        `[SiteContract.js beforeCreate] Error: ${err.message}. Stack: ${err.stack}`
      )
      throw err
    }
  }

  /**
   * beforeUpdateをオーバーライドします。
   * - 現場、開始日、勤務区分が変更されていないか確認します。
   * @returns {Promise<void>} - 成功すると解決されるPromise
   * @throws {Error} - 現場、開始日、勤務区分が変更されている場合にエラーをスローします。
   */
  async beforeUpdate() {
    // 現場ID、開始日、勤務区分は変更不可
    const [siteId, startDate, workShift] = this._beforeData
    if (
      siteId !== this.siteId ||
      startDate !== this.startDate ||
      workShift !== this.workShift
    ) {
      throw new Error('現場、開始日、勤務区分は変更できません。')
    }

    await super.beforeUpdate()
  }

  /**
   * createメソッドをオーバーライドします。
   * `docId`を`${siteId}-${startDate}-${workShift}`に固定します。
   * - 生成した`docId`を使用して親クラスのcreateメソッドを呼び出します。
   * @returns {Promise<DocumentReference>} 作成したドキュメントへの参照
   * @throws {Error} ドキュメント作成中にエラーが発生した場合にエラーをスローします
   */
  async create() {
    try {
      // `docId`を`${siteId}-${startDate}-${workShift}`の形式で生成
      const docId = `${this.siteId}-${this.startDate}-${this.workShift}`

      // 親クラスのcreateメソッドでドキュメントを作成
      return await super.create({ docId })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        `[create] Failed to create document for docId: ${this.siteId}-${this.startDate}-${this.workShift}. Error: ${err.message}`,
        {
          err,
        }
      )

      // エラーを再スローして呼び出し元に通知
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

  /**
   * 指定されたsiteId、startDate、workShift に基づいて現場取極めドキュメントを取得し、
   * 自身を初期化します。
   * - 指定された条件で最も新しい契約情報を1件取得します。
   *
   * @param {Object} params - siteId、date、workShiftを含むオブジェクト
   * @param {string} params.siteId - 契約情報を取得する現場のID
   * @param {string} params.date - 検索する日付（YYYY-MM-DD形式）
   * @param {string} params.workShift - 勤務区分 ('day' または 'night')
   * @returns {Promise<void>} - 処理が成功した場合はPromiseを返す
   * @throws {Error} - siteId、日付、または勤務区分が不正な場合にエラーをスローします
   */
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
      // eslint-disable-next-line no-console
      console.error(`[loadContract] Failed to fetch contracts: ${err.message}`)
      throw new Error(
        `[loadContract] Error fetching contract for siteId: ${siteId}, date: ${date}, workShift: ${workShift}.`
      )
    }
  }
}

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class SiteContractMinimal extends SiteContract {
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
