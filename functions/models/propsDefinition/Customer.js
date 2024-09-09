const { generateVueProps, generateClassProps } = require('./propsUtil')

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  code: { type: String, default: '', required: false, requiredByClass: false },
  name1: { type: String, default: '', required: false, requiredByClass: true },
  name2: { type: String, default: '', required: false, requiredByClass: false },
  abbr: { type: String, default: '', required: false, requiredByClass: true },
  abbrKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  zipcode: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  address1: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  address2: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  tel: { type: String, default: '', required: false, requiredByClass: false },
  fax: { type: String, default: '', required: false, requiredByClass: false },
  status: {
    type: String,
    default: 'active',
    validator: (v) => ['active', 'expired'].includes(v),
    required: false,
    requiredByClass: true,
  },
  deadline: {
    type: String,
    default: '99',
    validator: (v) => ['05', '10', '15', '20', '25', '99'].includes(v),
    required: false,
    requiredByClass: true,
  },
  depositMonth: {
    type: Number,
    default: 1,
    validator: (v) => v > 0,
    required: false,
    requiredByClass: true,
  },
  depositDate: {
    type: String,
    default: '99',
    validator: (v) => ['05', '10', '15', '20', '25', '99'].includes(v),
    required: false,
    requiredByClass: true,
  },
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  sync: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

module.exports.vueProps = vueProps
module.exports.classProps = classProps
