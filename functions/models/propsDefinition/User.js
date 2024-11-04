import { generateVueProps, generateClassProps } from './propsUtil.js'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  uid: { type: String, default: '', required: false, requiredByClass: true },
  email: { type: String, default: '', required: false, requiredByClass: true },
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
    requiredByClass: false, // 管理者など、従業員IDを持たないユーザーが発生する可能性あり。
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
