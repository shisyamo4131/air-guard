/*****************************************************************************
 * カスタムクラス定義: 現場取極め - SiteContract -
 *
 * @author shisyamo4131
 * @refact 2025-02-07
 *****************************************************************************/
import FireModel from './FireModel.js'
import { generateProps } from './propsDefinition/propsUtil.js'
import { SiteMinimal } from './Site.js'

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

const { classProps } = generateProps(propsDefinition)

/**
 * Cloud Functions で Firestore の SiteContracts ドキュメントを操作するためのクラスです。
 * FireMode を継承していますが、更新系のメソッドは利用できません。
 * @author shisyamo4131
 */
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
