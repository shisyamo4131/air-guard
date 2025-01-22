/**
 * 休暇実績データモデル
 */
import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false, requiredByClass: false },

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
    validator: (v) =>
      !v ||
      [
        'absent', // 欠勤
        'substitute', // 振替休日
        'compOff', // 代休
        'leave', // 休暇
      ].includes(v),
    required: false,
    requiredByClass: true,
  },

  // 振替出勤日
  substituteWorkDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 振替出勤日区分
  substitutedDayType: {
    type: String,
    default: '',
    validator: (v) =>
      !v || ['non-statutory-holiday', 'legal-holiday'].includes(v),
    required: false,
    requiredByClass: false,
  },

  // 年次有給休暇（休暇を選択された場合に年次有給とするかどうか）
  isAnnualPaidLeave: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // 有給休暇（休暇を選択された場合に年次ではない有給とするかどうか）
  isPaidLeave: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // 有給休暇である場合の支給率
  leavePaymentRate: {
    type: Number,
    default: 0,
    required: false,
    requiredByClass: true,
  },

  // 備考
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
