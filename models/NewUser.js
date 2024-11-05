import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/NewUser'

/**
 * ## NewUsers コレクションドキュメントデータモデル【物理削除】
 *
 * ‐ Users コレクションドキュメントを作成するためのデータモデルです。
 * - NewUsers コレクションドキュメントが作成されると Cloud Functions で Authentications ユーザーアカウントが
 *   作成され、Users コレクションドキュメントが作成されます。
 * - 作成された NewUsers コレクションドキュメントは Cloud Functions での処理が完了すると削除されます。
 * - update, delete メソッドは使用できません。
 *
 * @author shisyamo4131
 */
export default class NewUser extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'NewUsers'
  static classProps = classProps

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.tokenMap // tokenMap は不要
  }

  /**
   * update メソッドをオーバーライドし、使用不可能にします。
   */
  update() {
    throw new Error('NewUser クラスの update メソッドは使用できません。')
  }

  /**
   * delete メソッドをオーバーライドし、使用不可能にします。
   */
  delete() {
    throw new Error('NewUser クラスの delete メソッドは使用できません。')
  }
}
