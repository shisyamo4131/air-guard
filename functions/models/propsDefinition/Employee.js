import { generateVueProps, generateClassProps } from './propsUtil.js'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  code: { type: String, default: '', required: false, requiredByClass: false },
  lastName: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  firstName: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  lastNameKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  firstNameKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  abbr: { type: String, default: '', required: false, requiredByClass: true },
  gender: {
    type: String,
    default: 'male',
    required: false,
    requiredByClass: true,
  },
  birth: { type: String, default: '', required: false, requiredByClass: true },
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
  hasSendAddress: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
  sendZipcode: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  sendAddress1: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  sendAddress2: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  tel: { type: String, default: '', required: false, requiredByClass: false },
  mobile: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  hireDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  leaveDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  leaveReason: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  isForeigner: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
  nationality: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  bloodType: {
    type: String,
    default: '-',
    validator: (v) => ['A', 'B', 'O', 'AB', '-'].includes(v),
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
  imgRef: {
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

export { vueProps, classProps }
