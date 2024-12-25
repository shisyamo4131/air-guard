/**
 * 従業員休暇申請プロパティ定義
 */
import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  date: { type: String, default: '', required: false, requiredByClass: true },

  // 一括登録用プロパティ
  dates: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },

  month: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  employeeId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

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
