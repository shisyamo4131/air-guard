/**
 * 従業員休暇申請ドキュメント定義
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import { generateVueProps, generateClassProps } from './propsUtil'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false, requiredByClass: false },

  // 申請日（YYYY-MM-DD）
  date: { type: String, default: '', required: false, requiredByClass: true },

  // 申請年月（YYYY-MM）
  month: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 申請者ID（従業員ID）
  employeeId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 備考
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  /**
   * 申請状態
   * draft - 下書き
   * applied - 申請
   * approved - 承認
   * 申請・承認フローの仕様が固まるまでは、承認状態で登録
   */
  status: {
    type: String,
    default: 'approved',
    required: false,
    requiredByClass: true,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

/*****************************************************************************
 * ACCESSOR
 *****************************************************************************/
const month = {
  enumerable: true,
  configurable: true,
  get() {
    if (!this.date) return ''
    return this.date.slice(0, 7)
  },
  set(v) {},
}

const accessor = {
  month,
}

export { vueProps, classProps, accessor }
