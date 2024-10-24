/**
 * Properties of `SiteBilling`
 */
import { generateVueProps, generateClassProps } from './propsUtil'

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

export { vueProps, classProps }
