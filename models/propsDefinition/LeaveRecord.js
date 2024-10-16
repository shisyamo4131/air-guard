import { generateVueProps, generateClassProps } from './propsUtil'

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
    requiredByClass: true,
  },
  isAnnualPaidLeave: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: true,
  },
  isPaidLeave: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: true,
  },
  leavePaymentRate: {
    type: Number,
    default: 0,
    required: false,
    requiredByClass: true,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
