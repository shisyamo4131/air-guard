import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  customerId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  customer: {
    type: Object,
    default: null,
    required: false,
    requiredByClass: true,
  },
  code: { type: String, default: '', required: false, requiredByClass: false },
  name: { type: String, default: '', required: false, requiredByClass: true },
  abbr: { type: String, default: '', required: false, requiredByClass: true },
  abbrKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  abbrNumber: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  address: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  startAt: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  endAt: { type: String, default: '', required: false, requiredByClass: false },
  securityType: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  status: {
    type: String,
    default: 'active',
    required: false,
    requiredByClass: true,
  },
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  favorite: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
  sync: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
  isSpot: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
  recentContract: {
    type: Object,
    default: null,
    required: false,
    requireByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
