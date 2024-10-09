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
  // 日付
  date: { type: String, default: '', required: false, requiredByClass: true },
  // 日区分
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
  // 法定内労働時間（分）
  statutoryOvertimeMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 法定外労働時間（分）
  nonStatutoryOvertimeMinutes: {
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
  // 深夜労働時間（分）
  nighttimeWorkingTime: {
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
