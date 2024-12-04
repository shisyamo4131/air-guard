import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false, requiredByClass: false },

  // 従業員ID
  employeeId: {
    type: String,
    default: '',
    required: true,
    requiredByClass: true,
  },

  // 従業員
  employee: {
    type: Object,
    default: null,
    required: false,
    requiredByClass: true,
  },

  // 契約開始日
  startDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 契約期間の定め
  hasPeriod: {
    type: Boolean,
    default: true,
    required: false,
    requiredByClass: false,
  },

  // 契約満了日
  expiredDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 雇用形態
  contractType: {
    type: String,
    default: 'part-time',
    validator: (v) =>
      ['exective', 'full-time', 'contract', 'part-time'].includes(v),
    required: true,
    requiredByClass: true,
  },

  // 就業規則ID
  workRegulationId: {
    type: String,
    default: '',
    required: true,
    requiredByClass: true,
  },

  // 就業規則
  workRegulation: {
    type: Object,
    default: null,
    required: false,
    requiredByClass: true,
  },

  // 支給形態
  paymentType: {
    type: String,
    default: 'daily',
    validator: (v) => ['daily', 'monthly'].includes(v),
    requiredByClass: true,
  },

  // 基本給
  basicWage: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: true,
  },

  // 交通費支給
  providesTransportationAllowance: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // 健康保険加入
  isHealthInsuranceRequired: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // 厚生年金加入
  isPensionRequired: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // 雇用保険加入
  isEmploymentInsuranceRequired: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // 手当 ID の配列
  allowanceIds: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },

  // 手当
  allowances: {
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
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

/*****************************************************************************
 * ACCESSOR
 *****************************************************************************/

// 手当 IDS
const allowanceIds = {
  enumerable: true,
  configurable: true,
  get() {
    return this.allowances.map(({ docId }) => docId)
  },
  set(v) {},
}

const accessor = {
  allowanceIds,
}

export { vueProps, classProps, accessor }
