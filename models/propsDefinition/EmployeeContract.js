/**
 * 雇用契約ドキュメント定義
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import { EMPLOYEE_CONTRACT_TYPE } from '../constants/employee-contract-types'
import { PAYMENT_TYPE } from '../constants/payment-types'
import { EmployeeMinimal } from '../Employee'
import { WorkRegulationMinimal } from '../WorkRegulation'
import { generateVueProps, generateClassProps } from './propsUtil'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

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
    default: () => new EmployeeMinimal(),
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
  hasPeriod: { type: Boolean, default: true, required: false },

  // 契約満了日
  expiredDate: { type: String, default: '', required: false },

  // 雇用形態
  contractType: {
    type: String,
    default: 'part-time',
    validator: (v) => Object.keys(EMPLOYEE_CONTRACT_TYPE).includes(v),
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
    default: () => new WorkRegulationMinimal(),
    required: false,
    requiredByClass: true,
  },

  // 支給形態
  paymentType: {
    type: String,
    default: 'daily',
    validator: (v) => Object.keys(PAYMENT_TYPE).includes(v),
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
  },

  // 健康保険加入
  isHealthInsuranceRequired: {
    type: Boolean,
    default: false,
    required: false,
  },

  // 厚生年金加入
  isPensionRequired: {
    type: Boolean,
    default: false,
    required: false,
  },

  // 雇用保険加入
  isEmploymentInsuranceRequired: {
    type: Boolean,
    default: false,
    required: false,
  },

  // 手当 ID の配列
  allowanceIds: {
    type: Array,
    default: () => [],
    required: false,
  },

  // 手当
  allowances: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },

  // 備考
  remarks: { type: String, default: '', required: false },
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
