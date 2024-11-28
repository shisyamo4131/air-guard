import { logger } from 'firebase-functions'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/User.js'
/**
 * Cloud Functions で Firestore の Users ドキュメントを操作するためのクラスです。
 * FireModel の CRUD メソッドをすべて利用可能です。
 *
 * - Users ドキュメントは NewUsers ドキュメントの作成トリガーによって作成されます。
 * - Authentications からユーザーアカウントが削除されると、同期的に削除されます。
 * @author shisyamo4131
 */
export default class User extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Users'
  static logicalDelete = true
  static classProps = classProps

  /****************************************************************************
   * 指定された UID に該当する Users ドキュメントを削除します。
   * @param {string} uid - Authentications のユーザーIDです。
   ****************************************************************************/
  static async deleteByUid(uid) {
    try {
      const instance = new this()
      const isFetched = await instance.fetch(uid)
      if (isFetched) await instance.delete()
    } catch (error) {
      logger.error(
        `[deleteByUid] Users ドキュメントの削除処理に失敗しました。`,
        { uid }
      )
      throw error
    }
  }
}
