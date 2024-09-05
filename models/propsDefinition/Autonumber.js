import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  collectionId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  current: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: true,
  },
  length: {
    type: Number,
    default: 4,
    validator: (v) => v > 0,
    required: false,
    requiredByClass: true,
  },
  field: {
    type: String,
    default: 'code',
    required: false,
    requiredByClass: true,
  },
  status: {
    type: Boolean,
    default: true,
    required: false,
    requiredByClass: true,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
