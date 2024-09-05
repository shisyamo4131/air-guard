import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/User'

/**
 * Usersドキュメントデータモデル【論理削除】
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
export default class User extends FireModel {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item, 'Users', [], true, [], classProps)
  }
}
