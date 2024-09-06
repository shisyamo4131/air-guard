import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  name: { type: String, default: '', required: false, requiredByClass: true },
  code: { type: String, default: '', required: false, requiredByClass: false },
  colorSize: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  status: {
    type: String,
    default: 'active',
    validator: (v) => ['active', 'expired'].includes(v),
    required: false,
    requiredByClass: true,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
