import { generateVueProps, generateClassProps } from './propsUtil'

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

  // true だと admin 権限を付与
  isAdmin: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // true だと developer 権限を付与
  isDeveloper: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // true だと manager 権限を付与
  isManager: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
