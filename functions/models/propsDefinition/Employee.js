import SecurityRegistration from '../SecurityRegistration.js'
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
  fullName: {
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
  fullNameKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  abbr: { type: String, default: '', required: false, requiredByClass: true },
  abbrKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
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

  /**
   * 雇用形態
   */
  contractType: {
    type: String,
    default: 'full-time',
    validator: (v) =>
      ['exective', 'full-time', 'contract', 'part-time'].includes(v),
    required: false,
    requiredByClass: false,
  },

  /**
   * 役職・役割（略称の語尾に付与される）
   */
  designation: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  /**
   * 警備員登録有無
   */
  hasSecurityRegistration: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  /**
   * 警備員登録情報
   */
  securityRegistration: {
    type: Object,
    default: () => new SecurityRegistration().toObject(),
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

/*****************************************************************************
 * ACCESSOR
 *****************************************************************************/
const fullName = {
  configurable: true,
  enumerable: true,
  get() {
    if (!this.lastName || !this.firstName) return ''
    return `${this.lastName} ${this.firstName}`
  },
  set(v) {},
}

const fullNameKana = {
  enumerable: true,
  get() {
    if (!this.lastNameKana || !this.firstNameKana) return ''
    return `${this.lastNameKana} ${this.firstNameKana}`
  },
  set(v) {},
}

const accessor = { fullName, fullNameKana }
export { vueProps, classProps, accessor }
