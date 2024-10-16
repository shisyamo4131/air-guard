import { generateVueProps, generateClassProps } from './propsUtil.js'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  employeeId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  date: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  leaveType: {
    type: String,
    default: '',
    validator: (v) =>
      [
        'absent', // 欠勤
        'substitute', // 振替休日
        'compOff', // 代休
        'leave', // 休暇
      ].includes(v),
    required: false,
    requiredByClass: true,
  },
  substituteWorkDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  substitutedDayType: {
    type: String,
    default: '',
    validator: (v) => ['non-statutory-holiday', 'legal-holiday'].includes(v),
    required: false,
    requiredByClass: false,
  },
  isAnnualPaidLeave: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
  isPaidLeave: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
  leavePaymentRate: {
    type: Number,
    default: 0,
    required: false,
    requiredByClass: true,
  },
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
