const { generateVueProps, generateClassProps } = require('./propsUtil')

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  year: { type: String, default: '', required: false, requiredByClass: true },
  name: { type: String, default: '', required: false, requiredByClass: true },
  contractType: {
    type: String,
    default: 'full-time',
    validator: (v) =>
      ['exective', 'full-time', 'contract', 'part-time'].includes(v),
    required: false,
    requiredByClass: true,
  },
  scheduledWorkDays: {
    type: Array,
    default: () => ['mon', 'tue', 'wed', 'thu', 'fri'],
    required: false,
    requiredByClass: true,
  },
  legalHoliday: {
    type: String,
    default: 'sun',
    validator: (v) =>
      !v || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(v),
    required: false,
    requiredByClass: true,
  },
  isHolidayWorkDay: {
    type: Boolean,
    default: true,
    required: false,
    requiredByClass: false,
  },
  startTime: {
    type: String,
    default: '08:00',
    required: false,
    requiredByClass: true,
  },
  endTime: {
    type: String,
    default: '17:00',
    required: false,
    requiredByClass: true,
  },
  breakMinutes: {
    type: Number,
    default: 60,
    required: false,
    requiredByClass: true,
  },
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  overtimePayRate: {
    type: Number,
    default: 25,
    required: false,
    requiredByClass: true,
  },
  holidayPayRate: {
    type: Number,
    default: 35,
    required: false,
    requiredByClass: true,
  },
  bonusEligibility: {
    type: Boolean,
    default: true,
    required: false,
    requiredByClass: false,
  },
  averageMonthlyScheduledWorkDays: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: true,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

module.exports.vueProps = vueProps
module.exports.classProps = classProps
