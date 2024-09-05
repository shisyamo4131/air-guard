import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  equipmentId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  equipment: {
    type: Object,
    default: null,
    required: false,
    requiredByClass: true,
  },
  date: { type: String, default: '', required: false, requiredByClass: true },
  transactionType: {
    type: String,
    default: 'in',
    validator: (v) => ['in', 'out'].includes(v),
    required: false,
    requiredByClass: true,
  },
  amount: {
    type: Number,
    default: null,
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
