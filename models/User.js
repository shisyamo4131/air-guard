import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/User'

/**
 * ## Users コレクションドキュメントデータモデル【論理削除】
 *
 * - Users コレクションドキュメントは Authentications のアカウント作成時に同期作成されます。
 *   よって、モデル側での作成は不可能とします。
 * - Users コレクションドキュメントを削除すると Cloud Functions で Authentications のアカウントが無効になります。
 * - employeeId を保持し、Employees コレクションドキュメントと紐づけられます。
 *
 * NOTE:
 * - Users コレクションドキュメントは論理削除です。
 * - 論理削除したことにより無効となった Authentications アカウントを有効化するには
 *   該当の Users コレクションドキュメントを restore した後で Authentications アカウントを
 *   手動で操作します。
 *
 * @author shisyamo4131
 */
export default class User extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Users'
  static logicalDelete = true
  static classProps = classProps

  /**
   * create メソッドをオーバーライドし、使用不可能にします。
   */
  create() {
    throw new Error('User クラスの create メソッドは使用できません。')
  }
}
