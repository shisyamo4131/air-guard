const { generateVueProps, generateClassProps } = require('./propsUtil')

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
  workRegulationId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  startDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  hasPeriod: {
    type: Boolean,
    default: true,
    required: false,
    requiredByClass: false,
  },
  expiredDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  contractType: {
    type: String,
    default: 'part-time',
    validator: (v) => ['part-time', 'contract', 'full-time'].includes(v),
    required: false,
    requiredByClass: true,
  },
  paymentType: {
    type: String,
    default: 'daily',
    validator: (v) => ['daily', 'monthly'].includes(v),
    requiredByClass: true,
  },
  basicWage: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
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

module.exports.vueProps = vueProps
module.exports.classProps = classProps