/**
 * 稼働実績ドキュメントプロパティ定義
 * @author shisyamo4131
 * @refact 2025-01-25
 */
import OperationResultOutsourcer from '../OperationResultOutsourcer'
import OperationResultWorker from '../OperationResultWorker'
import { SiteMinimal } from '../Site'
import { SiteContractMinimal } from '../SiteContract'
import { generateVueProps, generateClassProps } from './propsUtil'
import ConsumptionTax from '~/plugins/consumption-tax'

/*****************************************************************************
 * OperationCount クラスで使用されるクラスです。
 * 人工数のための通常（normal）、半勤（half）、中止（cancel）、
 * および残業時間（overtimeMinutes）プロパティを提供します。
 * また、通常、半勤、中止の合計人工数として total プロパティを提供します。
 *****************************************************************************/
class Amount {
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
    // 通常
    this.normal = typeof item.normal === 'number' ? item.normal : 0

    // 半勤
    this.half = typeof item.half === 'number' ? item.half : 0

    // 中止
    this.cancel = typeof item.cancel === 'number' ? item.cancel : 0

    // 残業時間
    this.overtimeMinutes =
      typeof item.overtimeMinutes === 'number' ? item.overtimeMinutes : 0

    // 合計
    Object.defineProperties(this, {
      total: {
        configurable: true,
        enumerable: true,
        get() {
          return this.normal + this.half + this.cancel
        },
        set(v) {},
      },
    })
  }

  /***************************************************************************
   * TO OBJECT
   ***************************************************************************/
  toObject() {
    return { ...this }
  }
}

/*****************************************************************************
 * 稼働実績ドキュメントの稼働数（operationCount）プロパティを定義したクラスです。
 * Amount クラスインスタンスを資格なし（standard）、資格あり（qualified）プロパティ
 * として提供します。
 * また、資格の有無を無視した合計人工数と合計残業時間数をプロパティとして提供します。
 *****************************************************************************/
class OperationCount {
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
    // 資格なし人工数、残業時間
    this.standard = new Amount(item.standard || {})

    // 資格あり人工数、残業時間
    this.qualified = new Amount(item.qualified || {})

    Object.defineProperties(this, {
      // 合計人工数（資格有無関係なし）
      total: {
        configurable: true,
        enumerable: true,
        get() {
          return this.standard.total + this.qualified.total
        },
        set(v) {},
      },

      // 合計残業時間（資格有無関係なし）
      overtimeMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          return this.standard.overtimeMinutes + this.qualified.overtimeMinutes
        },
        set(v) {},
      },
    })
  }

  clone() {
    return new this.constructor(this)
  }

  /***************************************************************************
   * TO OBJECT
   ***************************************************************************/
  toObject() {
    return {
      ...this,
      standard: this.standard.toObject(),
      qualified: this.qualified.toObject(),
    }
  }
}

/*****************************************************************************
 * OperationUnitPrice, OperationSales クラスで使用されるクラスです。
 * 通常（normal）、半勤（half）、中止（cancel）、および残業（overtime）の
 * 単価情報のためのプロパティを提供します。
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
    // 通常単価
    this.normal = typeof item.normal === 'number' ? item.normal : 0

    // 半勤単価
    this.half = typeof item.half === 'number' ? item.half : 0

    // 中止単価
    this.cancel = typeof item.cancel === 'number' ? item.cancel : 0

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
 * 稼働実績ドキュメントで使用される単価情報のためのクラスです。
 * Price クラスインスタンスを資格なし（standard）、資格あり（qualified）プロパティ
 * として提供します。
 *****************************************************************************/
class OperationUnitPrice {
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
      ...this,
      standard: this.standard.toObject(),
      qualified: this.qualified.toObject(),
    }
  }
}

/*****************************************************************************
 * 稼働実績ドキュメントで使用される売上情報のためのクラスです。
 * Price クラスインスタンスを資格なし（standard）、資格あり（qualified）プロパティ
 * として提供します。
 *****************************************************************************/
class OperationSales {
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
      ...this,
      standard: this.standard.toObject(),
      qualified: this.qualified.toObject(),
    }
  }
}

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false, requiredByClass: false },

  // 稼働実績code
  code: { type: String, default: '', required: false, requiredByClass: false },

  // 現場ID
  siteId: { type: String, default: '', required: false, requiredByClass: true },

  // 現場オブジェクト（モデルによるフェッチ）
  site: {
    type: Object,
    default: () => new SiteMinimal(),
    required: false,
    requiredByClass: true,
  },

  // 稼働日（売上計上日）
  date: { type: String, default: '', required: false, requiredByClass: true },

  // 稼働月（売上計上月）
  month: { type: String, default: '', required: false, requiredByClass: true },

  // 曜日区分
  dayDiv: {
    type: String,
    default: 'weekdays',
    validator: (v) => ['weekdays', 'saturday', 'sunday', 'holiday'],
    required: false,
    requiredByClass: true,
  },

  // 勤務区分
  workShift: {
    type: String,
    default: 'day',
    validator: (v) => ['day', 'night'].includes(v),
    required: false,
    requiredByClass: true,
  },

  // 締日
  closingDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 従業員配列
  workers: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },

  // workers に含まれる従業員ID
  employeeIds: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },

  // 外注先配列
  outsourcers: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },

  // outsourcers に含まれる外注先ID
  outsourcerIds: {
    type: Array,
    default: () => [],
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

  // 現場取極めID
  siteContractId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 現場取極めオブジェクト
  siteContract: {
    type: Object,
    default: () => new SiteContractMinimal(),
    required: false,
    requiredByClass: true,
  },

  // 稼働数情報
  operationCount: {
    type: Object,
    default: () => new OperationCount(),
    required: false,
    requiredByClass: true,
  },

  // 単価情報
  unitPrice: {
    type: Object,
    default: () => new OperationUnitPrice(),
    required: false,
    requiredByClass: true,
  },

  // 売上情報
  sales: {
    type: Object,
    default: () => new OperationSales(),
    required: false,
    requiredByClass: true,
  },

  // ロック状態かどうか
  isLocked: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // 消費税額
  consumptionTax: {
    type: Object,
    default: () => {
      return {
        rate: null,
        amount: null,
      }
    },
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

/****************************************************************************
 * CUSTOM CLASS MAPPING
 ****************************************************************************/
const customClassMap = {
  site: SiteMinimal,
  siteContract: SiteContractMinimal,
  workers: OperationResultWorker,
  outsourcers: OperationResultOutsourcer,
  operationCount: OperationCount,
  unitPrice: OperationUnitPrice,
}

/*****************************************************************************
 * ACCESSOR
 *****************************************************************************/
const accessor = {
  /**
   * siteContractId を siteContract プロパティから取得して返します。
   */
  siteContractId: {
    configurable: true,
    enumerable: true,
    get() {
      return this.siteContract?.docId || ''
    },
    set(v) {},
  },

  /**
   * workers 配列から従業員IDの配列を生成して返します。
   */
  employeeIds: {
    enumerable: true,
    configurable: true,
    get() {
      return this.workers.map(({ employeeId }) => employeeId)
    },
    set(v) {},
  },

  /**
   * outsourcers 配列から外注先IDの配列を生成して返します。
   */
  outsourcerIds: {
    enumerable: true,
    configurable: true,
    get() {
      return [
        ...new Set(this.outsourcers.map(({ outsourcerId }) => outsourcerId)),
      ]
    },
    set(v) {},
  },

  /**
   * date プロパティから YYYY-MM 形式の年月文字列を生成して返します。
   */
  month: {
    enumerable: true,
    configurable: true,
    get() {
      if (!this.date) return ''
      return this.date.slice(0, 7)
    },
    set(v) {},
  },

  /**
   * workers, outsourcers 配列から人工数を計算し、OperationCount インスタンスとして
   * 返します。
   */
  operationCount: {
    configurable: true,
    enumerable: true,
    get() {
      const instance = new OperationCount()
      return this.workers.concat(this.outsourcers).reduce((sum, i) => {
        if (!i.qualification) {
          sum.standard[i.workResult] += 1
          sum.standard.total += 1
          sum.standard.overtimeMinutes += i.overtimeMinutes
        } else {
          sum.qualified[i.workResult] += 1
          sum.qualified.total += 1
          sum.qualified.overtimeMinutes += i.overtimeMinutes
        }
        sum.total += 1
        sum.overtimeMinutes += i.overtimeMinutes
        return sum
      }, instance)
    },
    set(v) {},
  },

  /**
   * siteContract プロパティから適用すべき単価情報を取得し、
   * UnitPrice インスタンスとして返します。
   */
  unitPrice: {
    configurable: true,
    enumerable: true,
    get() {
      const result = propsDefinition.unitPrice.default()

      // dayDivが設定されていない場合
      if (!this.dayDiv) return result

      // siteContractが設定されていない場合
      if (!this.siteContract?.docId) return result

      // unitPricesの取得に失敗した場合
      const unitPrices = this.siteContract?.unitPrices?.[this.dayDiv]
      if (!unitPrices) return result

      // 結果を構築して返す
      const calculateRates = (unitPrice) => ({
        normal: unitPrice?.price ?? 0,
        half: ((unitPrice?.price ?? 0) * this.siteContract.halfRate) / 100,
        cancel: ((unitPrice?.price ?? 0) * this.siteContract.cancelRate) / 100,
        overtime: unitPrice?.overtime ?? 0,
      })

      result.initialize({
        standard: calculateRates(unitPrices.standard),
        qualified: calculateRates(unitPrices.qualified),
      })

      return result
    },
    set(v) {
      // 空のsetメソッドを残す (Vueのリアクティブシステムのために必要)
    },
  },

  /**
   * operationCount, UnitPrice プロパティから売上情報を計算し、
   * OperationSales インスタンスとして返します。
   */
  sales: {
    configurable: true,
    enumerable: true,
    get() {
      const result = propsDefinition.sales.default()

      // unitPriceとoperationCountの存在をチェック
      if (!this.unitPrice || !this.operationCount) return result

      // スタンダードと有資格者の料金を計算する関数
      const calculate = (type) => {
        ;['normal', 'half', 'cancel'].forEach((key) => {
          result[type][key] =
            (this.operationCount[type]?.[key] || 0) *
            (this.unitPrice[type]?.[key] || 0)
        })

        // オーバータイムの計算（分単位を時間単位に変換）
        result[type].overtime =
          ((this.operationCount[type]?.overtimeMinutes || 0) / 60) *
          (this.unitPrice[type]?.overtime || 0)

        // 合計計算
        result[type].total =
          result[type].normal +
          result[type].half +
          result[type].cancel +
          result[type].overtime
      }

      // スタンダードと有資格者の料金を計算
      calculate('standard')
      calculate('qualified')

      // 全体の合計
      result.total = result.standard.total + result.qualified.total

      return result
    },
    set(v) {},
  },

  /**
   * sales プロパティから消費税額を計算し、税率とともに返します。
   */
  consumptionTax: {
    configurable: true,
    enumerable: true,
    get() {
      // consumptionTax インスタンスを作成
      const tax = ConsumptionTax(this.date, { rounding: 'round', unit: 0 })

      // 税率と消費税額を計算
      const rate = tax.rate
      const amount = tax.calc(this.sales.total)

      // オブジェクトで返す
      return {
        rate, // 適用された税率（例: 0.10）
        amount, // 消費税額（例: 100）
      }
    },
    set(v) {},
  },
}

export {
  vueProps,
  classProps,
  accessor,
  customClassMap,
  OperationCount,
  OperationUnitPrice,
}
