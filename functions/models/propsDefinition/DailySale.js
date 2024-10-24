import { generateVueProps, generateClassProps } from './propsUtil.js'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  date: { type: String, default: '', required: false, requiredByClass: true },
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
    if (!this.date) return ''
    return this.date.slice(0, 7)
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
    return this.operationResults.reduce(
      (sum, i) => sum + i.consumptionTax.amount,
      0
    )
  },
  set(v) {},
}

const accessor = {
  amount,
  consumptionTax,
  month,
  year,
}

export { vueProps, classProps, accessor }
