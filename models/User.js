/**
 * Usersドキュメントデータモデル
 *
 * - UsersドキュメントはAuthenticationのアカウント作成時に同期作成されます。
 * - uidはアプリ側では編集不可です。
 * - employeeIdを保持し、Employeesドキュメントと紐づけられます。
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
import { FireModel } from 'air-firebase'
const props = {
  props: {
    uid: { type: String, default: '', required: false },
    displayName: { type: String, default: '', required: false },
    employeeId: { type: String, default: '', required: false },
  },
}
export { props }

export default class User extends FireModel {
  constructor(item = {}) {
    super(item, 'Users', [], true, [])
  }

  initialize(item = {}) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }
}
