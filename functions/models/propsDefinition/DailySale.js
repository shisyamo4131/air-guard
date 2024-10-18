import { generateVueProps, generateClassProps } from './propsUtil.js'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  date: { type: String, default: '', required: false, requiredByClass: true },
  month: { type: String, default: '', required: false, requiredByClass: true },
  year: { type: String, default: '', required: false, requiredByClass: true },
  operationResults: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },
  amount: {
    type: Object,
    default: () => {
      return {
        operationResults: 0,
      }
    },
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
