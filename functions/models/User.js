const FireModel = require('./FireModel')
const { classProps } = require('./propsDefinition/User')
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
class User extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Users'
  static logicalDelete = true
  static classProps = classProps

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.create
    delete this.update
    delete this.delete
  }
}

module.exports = User
