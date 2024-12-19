/**
 * 従業員の社会保障データモデルのプロパティ定義
 */
import { HEALTH_INSURANCE_TYPE } from '../constants/health-insurance-types'
import { EmployeeMinimal } from '../Employee'
import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  /**
   * ドキュメントID
   * - 従業員IDで固定
   */
  docId: { type: String, default: '', required: false, requiredByClass: false },

  /**
   * 従業員ID
   */
  employeeId: {
    type: String,
    default: '',
    required: true,
    requiredByClass: true,
  },

  /**
   * 従業員オブジェクト
   */
  employee: {
    type: Object,
    default: () => new EmployeeMinimal(),
    required: false,
    requiredByClass: true,
  },

  /**
   * 健康保険種類（HEALTH_INSURANCE_TYPE から選択）
   */
  healthInsuranceType: {
    type: String,
    default: 'NONE',
    validator: (v) => Object.keys(HEALTH_INSURANCE_TYPE).includes(v),
    required: true,
    requiredByClass: true,
  },

  /**
   * 健康保険資格取得日（YYYY-MM-DD）
   */
  healthInsuranceAcquisitionDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  /**
   * 健康保険資格喪失日（YYYY-MM-DD）
   */
  healthInsuranceLossDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  /**
   * 健康保険標準報酬月額
   */
  healthInsuranceStandardMonthlyAmount: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: false,
  },

  /**
   * 健康保険被保険者整理番号
   */
  healthInsurancePolicyNumber: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  /**
   * 基礎年金番号
   */
  basicPensionNumber: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  /**
   * 厚生年金加入
   */
  isPensionEnrolled: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  /**
   * 厚生年金資格取得日（YYYY-MM-DD）
   */
  pensionAcquisitionDate: {
    type: String,
    default: '',
    required: true,
    requiredByClass: true,
  },

  /**
   * 厚生年金資格喪失日（YYYY-MM-DD）
   */
  pensionLossDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  /**
   * 厚生年金標準報酬月額
   */
  pensionStandardMonthlyAmount: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: false,
  },

  /**
   * 厚生年金被保険者整理番号
   */
  pensionPolicyNumber: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  /**
   * 雇用保険加入
   */
  isEmployeeInsuranceEnrolled: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  /**
   * 雇用保険資格取得日（YYYY-MM-DD）
   */
  employeeInsuranceAcquisitionDate: {
    type: String,
    default: '',
    required: true,
    requiredByClass: true,
  },

  /**
   * 雇用保険資格喪失日（YYYY-MM-DD）
   */
  employeeInsuranceLossDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  /**
   * 雇用保険被保険者番号
   */
  employeeInsurancePolicyNumber: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
