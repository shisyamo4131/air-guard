/**
 * Properties of `SiteBilling`
 */
import { generateVueProps, generateClassProps } from './propsUtil.js'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  /**
   * ${siteId}-${closingDate}
   */
  docId: { type: String, default: '', required: false, requiredByClass: false },
  customerId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  siteId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  closingDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  month: { type: String, default: '', required: false, requiredByClass: true },
  year: { type: String, default: '', required: false, requiredByClass: true },
  operationResults: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },
  amount: {
    type: Object,
    default: () => {
      return {
        operationResults: 0,
      }
    },
    required: false,
    requiredByClass: false,
  },
  // 税率が期間内に変更される可能性があるため、税率ごとに保存できるよう配列にしておく
  consumptionTaxs: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },
  consumptionTax: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

/*****************************************************************************
 * ACCESSOR
 *****************************************************************************/
const month = {
  configurable: true,
  enumerable: true,
  get() {
    if (!this.closingDate) return ''
    return this.closingDate.slice(0, 7)
  },
  set(v) {},
}

const year = {
  configurable: true,
  enumerable: true,
  get() {
    if (!this.month) return
    return this.month.slice(0, 4)
  },
  set(v) {},
}

const amount = {
  configurable: true,
  enumerable: true,
  get() {
    const result = { operationResults: 0 }
    result.operationResults = this.operationResults.reduce(
      (sum, i) => sum + i.sales.total,
      0
    )
    return result
  },
  set(v) {},
}

const consumptionTax = {
  configurable: true,
  enumerable: true,
  get() {
    return this.consumptionTaxs.reduce((sum, i) => sum + i.amount, 0)
  },
  set(v) {},
}

const consumptionTaxs = {
  configurable: true,
  enumerable: true,
  get() {
    // 税率ごとに消費税額を集計するための一時的なマップ
    const taxMap = this.operationResults.reduce((acc, result) => {
      const { rate, amount } = result.consumptionTax || {}

      // rate が存在しない場合はスキップ
      if (rate == null || amount == null) return acc

      // 既に同じ税率が存在する場合は合計、なければ初期化
      if (!acc[rate]) {
        acc[rate] = 0
      }
      acc[rate] += amount

      return acc
    }, {})

    // taxMapを配列形式に変換して返す
    return Object.keys(taxMap).map((rate) => ({
      rate: parseFloat(rate), // 税率をキーとして
      amount: taxMap[rate], // 消費税額を合計
    }))
  },
  set(v) {},
}

const accessor = {
  amount,
  consumptionTax,
  consumptionTaxs,
  month,
  year,
}

export { vueProps, classProps, accessor }
