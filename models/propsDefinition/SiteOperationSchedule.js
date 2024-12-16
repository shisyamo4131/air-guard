import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  date: { type: String, default: '', required: false, requiredByClass: true },
  /**
   * スケジュールの一括登録で使用するプロパティ。
   */
  dates: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },
  siteId: { type: String, default: '', required: false, requiredByClass: true },
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
    requiredByClass: false,
  },
  endTime: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  requiredWorkers: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: true,
  },
  qualification: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
  /**
   * 稼働予定に対する配置予定で使用する予定・・・
   */
  workers: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },
  /**
   * 稼働予定に対する配置予定で使用する予定・・・
   */
  outsourcers: {
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

  // 休工フラグ（true で休工）
  isClosed: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
