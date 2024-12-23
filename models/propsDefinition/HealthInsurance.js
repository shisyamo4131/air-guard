/**
 * 従業員の健康保険データモデルのプロパティ定義
 */
import { SOCIAL_SECURITY_PROCESSING_STATUS } from '../constants/processing-status'
import { EmployeeMinimal } from '../Employee'
import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  /**
   * ドキュメントID
   * - `${従業員ID}-${資格取得日}`
   */
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
    default: () => new EmployeeMinimal(),
    required: false,
    requiredByClass: false,
  },

  // 資格取得手続き状況
  acquisitionStatus: {
    type: String,
    default: 'IN_PROGRESS',
    validator: (v) =>
      Object.keys(SOCIAL_SECURITY_PROCESSING_STATUS).includes(v),
    required: false,
    requiredByClass: true,
  },

  // 資格取得日（YYYY-MM-DD）
  acquisitionDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 標準報酬月額
  standardMonthlyAmount: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: true,
  },

  // 資格喪失
  isLossed: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // 資格喪失日（YYYY-MM-DD）
  lossDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 資格取得手続き状況
  lossStatus: {
    type: String,
    default: 'IN_PROGRESS',
    validator: (v) =>
      Object.keys(SOCIAL_SECURITY_PROCESSING_STATUS).includes(v),
    required: false,
    requiredByClass: true,
  },

  // 被保険者整理番号
  policyNumber: {
    type: String,
    default: '',
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

export { vueProps, classProps }
