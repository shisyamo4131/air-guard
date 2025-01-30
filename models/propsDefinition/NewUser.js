/**
 * 新規ユーザードキュメント定義
 * - ユーザーアカウントの登録時のみ使用されるドキュメント
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import { generateVueProps, generateClassProps } from './propsUtil'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // メールアドレス
  email: { type: String, default: '', required: false, requiredByClass: true },

  // パスワード
  password: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 従業員ID
  employeeId: { type: String, default: '', required: false },

  // 表示名
  displayName: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
