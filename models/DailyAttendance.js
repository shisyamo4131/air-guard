/*****************************************************************************
 * カスタムクラス定義: 日次勤怠 - DailyAttendance -
 *
 * @author shisyamo4131
 * @refact 2025-02-01
 *****************************************************************************/
import { FireModel } from 'air-firebase'
import dayjs from 'dayjs'
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

/**
 * ACCESSOR
 */
const accessor = {
  // 曜日を日付から自動計算します。
  dayOfWeek: {
    configurable: true,
    enumerable: true,
    get() {
      if (!this.date) return ''
      return dayjs(this.date).format('ddd').toLowerCase()
    },
    set(v) {},
  },

  // 日区分（所定労働日、法定外休日、法定休日）
  dayType: {
    configurable: true,
    enumerable: true,
    get() {
      // 日付や契約データが存在しない場合は 'undefined' を返す
      if (!this.date) return 'undefined'

      // 雇用契約が存在しない場合は 'undefined' を返す
      if (!this.employeeContracts.length) return 'undefined'

      // employeeContracts を一度だけソートする
      const sortedContracts = [...this.employeeContracts].sort((a, b) =>
        a.startDate > b.startDate ? 1 : -1
      )

      // 該当する契約を見つける
      const applicableContract = sortedContracts.find((contract) => {
        return (
          contract.startDate <= this.date &&
          (!contract.expiredDate || contract.expiredDate >= this.date)
        )
      })

      // 該当する契約がない場合 'undefined' を返す
      if (!applicableContract) return 'undefined'

      // 就業規則を取得 -> 該当がなければ 'undefined' を返す
      const workRegulation = applicableContract.workRegulation
      if (!workRegulation) return 'undefined'

      // 一旦、就業規則に沿った dayType を設定
      let result = ''
      if (workRegulation.scheduledWorkDays.includes(this.dayOfWeek)) {
        result = 'scheduled'
      } else if (workRegulation.legalHoliday === this.dayOfWeek) {
        result = 'legal-holiday'
      } else {
        result = 'non-statutory-holiday'
      }

      // `scheduled` で isHolidayWorkDay が false かつ holidays に当該日が存在する場合は 'non-statutory-holiday' を設定
      if (
        result === 'scheduled' &&
        !workRegulation.isHolidayWorkDay &&
        workRegulation.holidays.includes(this.date)
      ) {
        result = 'non-statutory-holiday'
      }

      // 休暇申請がある場合の処理
      if (this.leaveRecord && this.leaveRecord.docId) {
        /**
         * 下記条件を満たす場合、振替出勤日と判断して scheduled を返す
         * - leaveRecord の leaveType が `substitute`
         * - leaveRecord の substituteWorkDate が 当該日
         */
        const isSubstituteWork =
          this.leaveRecord?.leaveType === 'substitute' &&
          this.leaveRecord?.substituteWorkDate === this.date
        if (isSubstituteWork) result = 'scheduled'

        /**
         * 下記条件を満たす場合、振替休日と判断
         * - leaveRecord の leaveType が `substitute`
         * - leaveRecord の date が 当該日
         * - substitutedDayType を設定
         */
        const isSubstituted =
          this.leaveRecord?.leaveType === 'substitute' &&
          this.leaveRecord?.date === this.date

        // 運用上かなりイレギュラーだが、振替の振替があるとここがうまくいかないのでは？
        if (isSubstituted) result = this.leaveRecord.substitutedDayType
      }

      return result
    },
    set(v) {},
  },

  // 勤怠区分（総労働時間が 0 より大きければ `present`）
  attendanceStatus: {
    configurable: true,
    enumerable: true,
    get() {
      // 日付未設定または勤務実績も休暇記録もなしの場合は undefined
      if (
        !this.date ||
        (!this.totalWorkingMinutes && !this.leaveRecord?.docId)
      ) {
        return 'undefined'
      }

      // 出勤実績があれば present
      if (this.totalWorkingMinutes > 0) {
        return 'present'
      }

      // 休暇記録があれば leaveType に従う
      return this.leaveRecord.leaveType || 'undefined'
    },
    set(v) {},
  },

  isNextDayLegalHoliday: {
    configurable: true,
    enumerable: true,
    get() {
      // 日付や契約データが存在しない場合は false を返す
      if (!this.nextDay) return false
      if (
        !Array.isArray(this.employeeContracts) ||
        !this.employeeContracts.length
      )
        return false

      // employeeContracts を一度だけソートする
      const sortedContracts = [...this.employeeContracts].sort((a, b) =>
        a.startDate > b.startDate ? 1 : -1
      )

      // 該当する契約を見つける
      const applicableContract = sortedContracts.find((contract) => {
        return (
          contract.startDate <= this.nextDay &&
          (!contract.expiredDate || contract.expiredDate >= this.nextDay)
        )
      })

      // 該当する契約がない場合は false を返す
      if (!applicableContract) return false

      // nextDayOfWeek を計算（必要に応じて dayjs ライブラリなどを使用）
      const nextDayOfWeek = dayjs(this.nextDay).format('ddd').toLowerCase()

      // 法定休日かどうかを判定
      const isLegalHoliday =
        applicableContract.workRegulation.legalHoliday === nextDayOfWeek

      return isLegalHoliday
    },
    set(v) {},
  },
}

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

  // initialize をオーバーライドし、accessor を適用
  initialize(item = {}) {
    super.initialize(item)
    Object.defineProperties(this, {
      dayOfWeek: accessor.dayOfWeek,
      dayType: accessor.dayType,
      attendanceStatus: accessor.attendanceStatus,
    })
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
