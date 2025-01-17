/**
 * 稼働実績ドキュメントプロパティ定義
 * @author shisyamo4131
 * @refact 2025-01-13
 */
import { SiteMinimal } from '../Site'
import { SiteContractMinimal } from '../SiteContract'
import { generateVueProps, generateClassProps } from './propsUtil'
import ConsumptionTax from '~/plugins/consumption-tax'

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
    // 2025-01-13 既定値に現場取極めのインスタンスを定義
    // default: null,
    default: () => new SiteContractMinimal(),
    required: false,
    requiredByClass: true,
  },

  // 稼働数情報
  operationCount: {
    type: Object,
    default: () => {
      return {
        standard: {
          normal: 0,
          half: 0,
          cancel: 0,
          total: 0,
          overtimeMinutes: 0,
        },
        qualified: {
          normal: 0,
          half: 0,
          cancel: 0,
          total: 0,
          overtimeMinutes: 0,
        },
        total: 0,
        overtimeMinutes: 0,
      }
    },
    required: false,
    requiredByClass: true,
  },

  // 単価情報
  unitPrice: {
    type: Object,
    default: () => {
      return {
        standard: {
          normal: null,
          half: null,
          cancel: null,
          overtime: null,
        },
        qualified: {
          normal: null,
          half: null,
          cancel: null,
          overtime: null,
        },
      }
    },
    required: false,
    requiredByClass: true,
  },

  // 売上情報
  sales: {
    type: Object,
    default: () => {
      return {
        standard: {
          normal: 0,
          half: 0,
          cancel: 0,
          total: 0,
          overtime: 0,
        },
        qualified: {
          normal: 0,
          half: 0,
          cancel: 0,
          total: 0,
          overtime: 0,
        },
        total: 0,
      }
    },
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

/*****************************************************************************
 * ACCESSOR
 *****************************************************************************/
// 取極めID
const siteContractId = {
  configurable: true,
  enumerable: true,
  get() {
    return this.siteContract?.docId || ''
  },
  set(v) {},
}

// 従業員IDS
const employeeIds = {
  enumerable: true,
  configurable: true,
  get() {
    return this.workers.map(({ employeeId }) => employeeId)
  },
  set(v) {},
}

// 外注先IDS
const outsourcerIds = {
  enumerable: true,
  configurable: true,
  get() {
    return [
      ...new Set(this.outsourcers.map(({ outsourcerId }) => outsourcerId)),
    ]
  },
  set(v) {},
}

// 売上年月
const month = {
  enumerable: true,
  configurable: true,
  get() {
    if (!this.date) return ''
    return this.date.slice(0, 7)
  },
  set(v) {},
}

// 稼働数
const operationCount = {
  configurable: true,
  enumerable: true,
  get() {
    const defaultValue = propsDefinition.operationCount.default()
    const result = this.workers.concat(this.outsourcers).reduce((sum, i) => {
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
    }, defaultValue)

    return result
  },
  set(v) {},
}

// 単価
const unitPrice = {
  configurable: true,
  enumerable: true,
  get() {
    // dayDivが設定されていない場合
    if (!this.dayDiv) return null

    // siteContractが設定されていない場合
    if (!this.siteContract?.docId) return null

    // unitPricesの取得に失敗した場合
    const unitPrices = this.siteContract?.unitPrices?.[this.dayDiv]
    if (!unitPrices) return null

    // 結果を構築して返す
    return {
      standard: {
        normal: unitPrices.standard?.price ?? null,
        half:
          ((unitPrices.standard?.price ?? null) * this.siteContract.halfRate) /
          100,
        cancel:
          ((unitPrices.standard?.price ?? null) *
            this.siteContract.cancelRate) /
          100,
        overtime: unitPrices.standard?.overtime ?? null,
      },
      qualified: {
        normal: unitPrices.qualified?.price ?? null,
        half:
          ((unitPrices.qualified?.price ?? null) * this.siteContract.halfRate) /
          100,
        cancel:
          ((unitPrices.qualified?.price ?? null) *
            this.siteContract.cancelRate) /
          100,
        overtime: unitPrices.qualified?.overtime ?? null,
      },
    }
  },
  set(v) {
    // 空のsetメソッドを残す (Vueのリアクティブシステムのために必要)
  },
}

// 売上
const sales = {
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
}

// 消費税
const consumptionTax = {
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
}

const accessor = {
  consumptionTax,
  employeeIds,
  month,
  operationCount,
  outsourcerIds,
  unitPrice,
  sales,
  siteContractId,
}

export { vueProps, classProps, accessor }
