/**
 * 休暇実績ドキュメント定義
 * - LeaveApplication とは別物です。
 * - 日次勤怠実績ドキュメントの leaveRecord プロパティとして使用されます。
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import { LEAVE_TYPE } from '../constants/attendance-status'
import { DAY_TYPE } from '../constants/day-types'
import { generateProps } from './propsUtil'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
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
  date: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 休暇種別
  leaveType: {
    type: String,
    default: '',
    validator: (v) => !v || Object.keys(LEAVE_TYPE).includes(v),
    required: false,
    requiredByClass: true,
  },

  // 振替出勤日
  substituteWorkDate: { type: String, default: '', required: false },

  /**
   * 振替出勤日区分
   * - non-statutory-holiday または leagal-holiday
   */
  substitutedDayType: {
    type: String,
    default: '',
    validator: (v) =>
      !v ||
      Object.keys(DAY_TYPE)
        .filter((key) => DAY_TYPE[key].type === 'holiday')
        .includes(v),
    required: false,
    requiredByClass: false,
  },

  // 年次有給休暇（休暇を選択された場合に年次有給とするかどうか）
  isAnnualPaidLeave: { type: Boolean, default: false, required: false },

  // 有給休暇（休暇を選択された場合に年次ではない有給とするかどうか）
  isPaidLeave: { type: Boolean, default: false, required: false },

  // 有給休暇である場合の支給率
  leavePaymentRate: {
    type: Number,
    default: 0,
    required: false,
    requiredByClass: true,
  },

  // 備考
  remarks: { type: String, default: '', required: false },
}

const { vueProps, classProps } = generateProps(propsDefinition)

export { vueProps, classProps }
