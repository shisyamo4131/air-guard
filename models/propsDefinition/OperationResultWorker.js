import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  employeeId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  date: { type: String, default: '', required: false, requiredByClass: true },
  startTime: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  endTime: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  endAtNextday: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
  breakMinutes: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: true,
  },
  workMinutes: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: true,
  },
  overtimeMinutes: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: true,
  },
  nighttimeMinutes: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: true,
  },
  qualification: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
  ojt: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
  scheduledWorkMinutes: {
    type: Number,
    default: 480,
    required: false,
    requiredByClass: true,
  },
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  isValid: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
