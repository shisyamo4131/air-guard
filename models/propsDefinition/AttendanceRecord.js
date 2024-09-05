import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  employeeId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  employee: {
    type: Object,
    default: null,
    required: false,
    requiredByClass: true,
  },
  month: { type: String, default: '', required: false, requiredByClass: true },
  scheduledWorkingTime: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  statutoryOverTime: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  nonStatutoryOverTime: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  holidayWorkingTime: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  midnightWorkingTime: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  scheduledWorkingDays: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  statutoryWorkingDays: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  holidayWorkingDays: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
  absenceDays: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: false,
  },
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
