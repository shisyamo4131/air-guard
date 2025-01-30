/**
 * 現場取極めドキュメント定義
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import dayjs from 'dayjs'
import { WORK_SHIFT } from '../constants/work-shifts'
import { SiteMinimal } from '../Site'
import { generateProps } from './propsUtil'

/*****************************************************************************
 * 単価情報のためのプロパティを提供するクラスです。
 *****************************************************************************/
class Price {
  /***************************************************************************
   * CONSTRUCTOR
   ***************************************************************************/
  constructor(item = {}) {
    this.initialize(item)
  }

  /***************************************************************************
   * INITIALIZE
   ***************************************************************************/
  initialize(item = {}) {
    // 単価
    this.price = typeof item.price === 'number' ? item.price : 0

    // 残業単価
    this.overtime = typeof item.overtime === 'number' ? item.overtime : 0
  }

  /***************************************************************************
   * TO OBJECT
   ***************************************************************************/
  toObject() {
    return { ...this }
  }
}

/*****************************************************************************
 * 資格あり、資格なし単価情報のためのプロパティを提供するクラスです。
 *****************************************************************************/
class UnitPrice {
  /***************************************************************************
   * CONSTRUCTOR
   ***************************************************************************/
  constructor(item = {}) {
    this.initialize(item)
  }

  /***************************************************************************
   * INITIALIZE
   ***************************************************************************/
  initialize(item = {}) {
    // 資格なし
    this.standard = new Price(item.standard || {})

    // 資格あり
    this.qualified = new Price(item.qualified || {})
  }

  /***************************************************************************
   * TO OBJECT
   ***************************************************************************/
  toObject() {
    return {
      standard: this.standard.toObject(),
      qualified: this.qualified.toObject(),
    }
  }
}

/*****************************************************************************
 * 曜日区分別単価情報のためのプロパティを提供するクラスです。
 *****************************************************************************/
class UnitPrices {
  /***************************************************************************
   * CONSTRUCTOR
   ***************************************************************************/
  constructor(item = {}) {
    this.initialize(item)
  }

  /***************************************************************************
   * INITIALIZE
   ***************************************************************************/
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

  /***************************************************************************
   * TO OBJECT
   ***************************************************************************/
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

/****************************************************************************
 * CUSTOM CLASS MAPPING
 ****************************************************************************/
const customClassMap = {
  site: SiteMinimal,
  unitPrices: UnitPrices,
}

/*****************************************************************************
 * ACCESSOR
 *****************************************************************************/
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
export { vueProps, classProps, customClassMap, accessor, UnitPrices }
