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
  date: { type: String, default: '', required: false, requiredByClass: true },
  type: {
    type: String,
    default: 'entry',
    validator: (v) => ['entry', 'regular'].includes(v),
    required: false,
    requiredByClass: true,
  },
  agency: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  bloodTop: {
    type: Number,
    default: null,
    validator: (v) => v > 0,
    required: false,
    requiredByClass: true,
  },
  bloodBottom: {
    type: Number,
    default: null,
    validator: (v) => v > 0,
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

export { vueProps, classProps }
