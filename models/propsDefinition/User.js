/**
 * ユーザードキュメント定義
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import { generateProps } from './propsUtil'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // uid（Authentication の uid）
  uid: { type: String, default: '', required: false, requiredByClass: true },

  // メールアドレス
  email: { type: String, default: '', required: false, requiredByClass: true },

  // 表示名
  displayName: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 従業員ID
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

const { vueProps, classProps } = generateProps(propsDefinition)

export { vueProps, classProps }
