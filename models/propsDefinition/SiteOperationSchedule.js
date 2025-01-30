/**
 * 現場稼働予定ドキュメント定義
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import { generateVueProps, generateClassProps } from './propsUtil'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 日付
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

  // 現場ID
  siteId: { type: String, default: '', required: false, requiredByClass: true },

  // 勤務区分
  workShift: {
    type: String,
    default: 'day',
    validator: (v) => ['day', 'night'].includes(v),
    required: false,
    requiredByClass: true,
  },

  // 開始時刻
  startTime: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 終了時刻
  endTime: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 必要人数
  requiredWorkers: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: true,
  },

  // 要資格者フラグ
  qualification: {
    type: Boolean,
    default: false,
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
