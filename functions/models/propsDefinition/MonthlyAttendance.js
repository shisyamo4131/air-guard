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
  // 従業員CODE -> freee への CSV 出力に必要
  employeeCode: {
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
  // 所定休日労働日数
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
  // 休日労働日数
  holidayWorkingDays: {
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
  // 遅刻時間（分）
  lateMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 早退時間（分）
  leaveEarlyMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 欠勤日数
  absentDays: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 遅刻日数
  lateDays: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 早退日数
  leaveEarlyDays: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 年休取得日数
  annualPaidLeaveDays: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  // 出勤簿ドキュメント（当月）
  dailyAttendances: {
    type: Object,
    default: () => [],
    required: false,
    requiredByClass: false,
  },
  // 出勤簿ドキュメント（前月）
  dailyAttendancesPrev: {
    type: Object,
    default: () => [],
    required: false,
    requiredByClass: false,
  },
  // 出勤簿ドキュメント（翌月）
  dailyAttendancesNext: {
    type: Object,
    default: () => [],
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

/*****************************************************************************
 * ACCESSOR
 *****************************************************************************/
/**
 * 所定労働時間（分）
 * - dailyAttendances の scheduledWorkMinutes の合計を返します。
 */
const scheduledWorkMinutes = {
  configurable: true,
  enumerable: true,
  get() {
    return this.dailyAttendances.reduce(
      (sum, i) => sum + i.scheduledWorkMinutes,
      0
    )
  },
  set(v) {},
}

/**
 * 所定内労働時間（分）
 * - dailyAttendances の scheduledWorkingMinutes の合計を返します。
 */
const scheduledWorkingMinutes = {
  configurable: true,
  enumerable: true,
  get() {
    return this.dailyAttendances.reduce(
      (sum, i) => sum + i.scheduledWorkingMinutes,
      0
    )
  },
  set(v) {},
}

const accessor = { scheduledWorkMinutes, scheduledWorkingMinutes }
export { vueProps, classProps, accessor }
