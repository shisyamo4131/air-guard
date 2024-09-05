import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  uid: { type: String, default: '', required: false, requiredByClass: true },
  displayName: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  employeeId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
