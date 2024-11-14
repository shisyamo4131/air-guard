import { generateVueProps, generateClassProps } from './propsUtil.js'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  code: { type: String, default: '', required: false, requiredByClass: false },
  name: { type: String, default: '', required: false, requiredByClass: true },
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

export { vueProps, classProps }
