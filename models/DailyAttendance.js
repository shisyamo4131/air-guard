/*****************************************************************************
 * カスタムクラス定義: 日次勤怠 - DailyAttendance -
 *
 * @author shisyamo4131
 * @refact 2025-02-01
 *****************************************************************************/
import { FireModel } from 'air-firebase'
import OperationWorkResult from './OperationWorkResult'
import LeaveRecord from './LeaveRecord'
import { DAY_TYPE_ARRAY } from './constants/day-types'
import { ATTENDANCE_STATUS } from './constants/attendance-status'
import { generateProps } from './propsDefinition/propsUtil'
import EmployeeContract from './EmployeeContract'

/**
 * PROPERTIES
 */
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 従業員ID
  employeeId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 日付
  date: { type: String, default: '', required: false, requiredByClass: true },

  // 日区分
  dayType: {
    type: String,
    default: 'scheduled',
    validator: (v) => DAY_TYPE_ARRAY.includes(v),
    required: false,
  },

  /**
   * 雇用契約配列
   * - 当該日次勤怠で適用すべき従業員の雇用契約ドキュメントの配列
   * - なぜ配列にしたのか不明。格納されるオブジェクトは必ず1つのはず。
   */
  employeeContracts: { type: Array, default: () => [], required: false },

  /**
   * 稼働実績配列
   * - 当該日次勤怠の根拠となる稼働実績ドキュメントの配列
   */
  operationWorkResults: { type: Array, default: () => [], required: false },

  // 休暇記録
  leaveRecord: {
    type: Object,
    default: () => new LeaveRecord(),
    required: false,
  },

  // 勤怠結果
  attendanceStatus: {
    type: String,
    default: 'undefined',
    validator: (v) => Object.keys(ATTENDANCE_STATUS).includes(v),
    required: false,
  },

  // 始業時刻（Dateオブジェクト）
  startTime: { type: Object, default: null, required: false },

  // 終業時刻（Dateオブジェクト）
  endTime: { type: Object, default: null, required: false },

  // 休憩時間（分）
  breakMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
  },

  // 総労働時間（分）
  totalWorkingMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
  },

  // 総労働時間のうち、当日分（分）
  currentDayWorkingMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
  },

  // 総労働時間のうち、翌日分（分）
  nextDayWorkingMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
  },

  // 休日労働時間（分）
  holidayWorkingMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
  },

  // 所定労働時間（分）
  scheduledWorkMinutes: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
  },

  // 翌日が法定休日かを表すフラグ
  isNextDayLegalHoliday: {
    type: Boolean,
    default: false,
    required: false,
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

const { vueProps, classProps } = generateProps(propsDefinition)
export { vueProps, classProps }

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class DailyAttendance extends FireModel {
  // FireModel 設定
  static collectionPath = 'DailyAttendances'
  static classProps = classProps

  // カスタムクラスマップ
  static customClassMap = {
    employeeContracts: EmployeeContract,
    leaveRecord: LeaveRecord,
    operationWorkResults: OperationWorkResult,
  }

  /**
   * 休憩時間（時間単位）を返します。
   */
  get breakHours() {
    return this.breakMinutes / 60
  }

  /**
   * 法定外残業時間（時間単位）を返します。
   */
  get nonStatutoryOvertimeHours() {
    return this.nonStatutoryOvertimeMinutes / 60
  }

  /**
   * 所定労働時間（時間単位）を返します。
   */
  get scheduledWorkingHours() {
    return this.scheduledWorkingMinutes / 60
  }
}
