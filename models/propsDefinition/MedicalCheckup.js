/**
 * 健康診断情報ドキュメントデータモデル
 */
import { MEDICAL_CHECKUP_TYPES } from '../constants/medical-checkup-types'
import { EmployeeMinimal } from '../Employee'
import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  /**
   * ドキュメントID
   * - `${従業員ID}-${受診日}` で固定
   */
  docId: { type: String, default: '', required: false, requiredByClass: false },

  /**
   * 従業員ID
   */
  employeeId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  /**
   * 従業員
   */
  employee: {
    type: Object,
    default: () => new EmployeeMinimal(),
    validator: (instance) => instance instanceof EmployeeMinimal,
    required: false,
    requiredByClass: true,
  },

  /**
   * 受診日 (YYYY-MM-DD)
   */
  date: { type: String, default: '', required: false, requiredByClass: true },

  /**
   * 受診区分
   * { entry: '入社時', regular: '法定検診', other: 'その他' }
   */
  type: {
    type: String,
    default: 'ENTRY',
    validator: (v) => Object.keys(MEDICAL_CHECKUP_TYPES).includes(v),
    required: false,
    requiredByClass: true,
  },

  /**
   * 受診機関
   */
  agency: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  /**
   * 血圧（上）
   */
  bloodTop: {
    type: Number,
    default: null,
    validator: (v) => v > 0,
    required: false,
    requiredByClass: true,
  },

  /**
   * 血圧（下）
   */
  bloodBottom: {
    type: Number,
    default: null,
    validator: (v) => v > 0,
    required: false,
    requiredByClass: true,
  },

  /**
   * 所見の有無
   */
  hasFindings: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: true,
  },

  /**
   * 備考
   */
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
