import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  // 従業員ID
  employeeId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  // 従業員
  employee: {
    type: Object,
    default: null,
    required: false,
    requiredByClass: true,
  },
  // 年月
  month: { type: String, default: '', required: false, requiredByClass: true },
  // 所定内労働時間（分）
  scheduledWorkingMinutes: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 所定外労働時間（分）
  nonScheduledWorkingMinutes: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 法定内労働時間（分）
  statutoryOvertimeMinutes: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 法定外労働時間（分）
  nonStatutoryOvertimeMinutes: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 休日労働時間（分）
  holidayWorkingMinutes: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 深夜労働時間（分）
  nighttimeWorkingTime: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 所定労働日数
  scheduledWorkingDays: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 所定休日労働日数
  statutoryWorkingDays: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 休日労働日数
  holidayWorkingDays: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 欠勤日数
  absenceDays: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 有給休暇取得日数
  annualVacationDays: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
