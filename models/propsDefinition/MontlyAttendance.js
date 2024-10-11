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
  // 年月
  month: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  // 計算開始日
  startDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  // 計算終了日
  endDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  // 総勤務日数
  totalWorkingDays: {
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
  // 所定労働日数
  totalScheduledWorkDays: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 所定内労働日数
  totalScheduledWorkingDays: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 所定外労働日数
  totalNonScheduledWorkingDays: {
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
  // 所定内労働時間（分）
  scheduledWorkingMinutes: {
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
  // 深夜労働時間（分）
  nighttimeWorkingMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  dailyAttendances: {
    type: Object,
    default: () => [],
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
