const { generateVueProps, generateClassProps } = require('./propsUtil')

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  employeeId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  siteId: { type: String, default: '', required: false, requiredByClass: true },
  firstDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  firstOperationResultId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  lastDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  lastOperationResultId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

module.exports.vueProps = vueProps
module.exports.classProps = classProps
