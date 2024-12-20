/**
 * 従業員の雇用保険データモデルのプロパティ定義
 */
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

  // 資格取得日（YYYY-MM-DD）
  acquisitionDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 資格喪失日（YYYY-MM-DD）
  lossDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 被保険者整理番号
  policyNumber: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
