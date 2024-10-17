import { generateVueProps, generateClassProps } from './propsUtil.js'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  // 従業員ID
  employeeId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  // 雇用契約（配列）
  employeeContracts: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },
  // 稼働実績（配列）
  operationWorkResults: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },
  // 休暇記録
  leaveRecord: {
    type: Object,
    default: () => ({}),
    required: false,
    requiredByClass: false,
  },
  // 日付
  date: { type: String, default: '', required: false, requiredByClass: true },
  // 労働日区分
  dayType: {
    type: String,
    default: 'scheduled',
    validator: (v) =>
      [
        'scheduled',
        'non-statutory-holiday',
        'legal-holiday',
        'undefined',
      ].includes(v),
    required: false,
    requiredByClass: false,
  },
  // 勤怠結果
  attendanceStatus: {
    type: String,
    default: 'undefined',
    validator: (v) =>
      [
        'undefined', // 未定
        'present', // 出勤
        'absent', // 欠勤
        'substitute', // 振替休日
        'compOff', // 代休
        'leave', // 休暇
      ].includes(v),
    required: false,
    requiredByClass: false,
  },
  // 始業時刻（Dateオブジェクト）
  startTime: {
    type: Object,
    default: null,
    required: false,
    requiredByClass: false,
  },
  // 終業時刻（Dateオブジェクト）
  endTime: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  // 休憩時間（分）
  breakMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 総労働時間（分）
  totalWorkingMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 総労働時間のうち、当日分（分）
  currentDayWorkingMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 総労働時間のうち、翌日分（分）
  nextDayWorkingMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 休日労働時間（分）
  holidayWorkingMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 所定労働時間（分）
  scheduledWorkMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 翌日が法定休日かを表すフラグ
  isNextDayLegalHoliday: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
  // 所定内労働時間（分）
  scheduledWorkingMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 所定外労働時間（分）
  nonScheduledWorkingMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 法定内労働時間（分）-> daily
  statutoryOvertimeMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 法定外労働時間（分）-> daily
  nonStatutoryOvertimeMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 深夜労働時間（分）
  nighttimeWorkingMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
