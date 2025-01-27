import { generateVueProps, generateClassProps } from './propsUtil.js'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  siteId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  site: {
    type: Object,
    default: null,
    required: false,
    requiredByClass: true,
  },
  startDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  workShift: {
    type: String,
    default: 'day',
    validator: (v) => ['day', 'night'].includes(v),
    required: false,
    requiredByClass: true,
  },
  startTime: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  endTime: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  endAtNextday: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
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

  unitPrices: {
    type: Object,
    default: () => {
      return {
        weekdays: {
          standard: { price: 0, overtime: 0 },
          qualified: { price: 0, overtime: 0 },
        },
        saturday: {
          standard: { price: 0, overtime: 0 },
          qualified: { price: 0, overtime: 0 },
        },
        sunday: {
          standard: { price: 0, overtime: 0 },
          qualified: { price: 0, overtime: 0 },
        },
        holiday: {
          standard: { price: 0, overtime: 0 },
          qualified: { price: 0, overtime: 0 },
        },
      }
    },
    required: false,
    requiredByClass: false,
  },
  halfRate: {
    type: Number,
    default: 50,
    required: false,
    requiredByClass: true,
  },
  cancelRate: {
    type: Number,
    default: 100,
    required: false,
    requiredByClass: true,
  },
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
