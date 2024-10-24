import { generateVueProps, generateClassProps } from './propsUtil.js'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  code: { type: String, default: '', required: false, requiredByClass: false },
  siteId: { type: String, default: '', required: false, requiredByClass: true },
  site: {
    type: Object,
    default: null,
    required: false,
    requiredByClass: true,
  },
  // 稼働日（売上計上日）
  date: { type: String, default: '', required: false, requiredByClass: true },
  // 稼働月（売上計上月）
  month: { type: String, default: '', required: false, requiredByClass: true },
  dayDiv: {
    type: String,
    default: 'weekdays',
    validator: (v) => ['weekdays', 'saturday', 'sunday', 'holiday'],
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
  closingDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
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
  // workers に含まれる外注先ID
  outsourcerIds: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  siteContract: {
    type: Object,
    default: null,
    required: false,
    requiredByClass: true,
  },
  outsourcers: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },

  // 以下、Object.definePropertyで上書きされるプロパティ
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
  siteContractId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
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
  isLocked: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
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

export { vueProps, classProps }
