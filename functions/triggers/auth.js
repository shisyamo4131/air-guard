/****************************************************************************
 * Firebase Authenticationのユーザー作成・削除イベントに対応して、Firestoreに
 * 対応するドキュメントを作成・削除するためのFirebase Cloud Functionsです。
 *
 * 機能:
 * - ユーザーが新規作成された際に、Firestoreの`Users`コレクションにドキュメントを作成
 * - ユーザーが削除された際に、Firestoreの`Users`コレクションから対応するドキュメントを削除
 *
 * この関数は、Firebase Authenticationのユーザーライフサイクルイベントをトリガーに
 * Firestoreのデータを適切に管理することを目的としています。
 *
 * @version 1.0.0
 ****************************************************************************/

import functions, { logger } from 'firebase-functions/v1'
import User from '../models/User.js'

/****************************************************************************
 * Firebase Authenticationでユーザーが削除されたときに呼び出される関数です。
 * 削除されたユーザーに対応するFirestoreの`Users`コレクションのドキュメントを削除します。
 * @param {Object} user - 削除されたユーザーの情報（UIDなどが含まれています）
 * @returns {Promise<void>} Firestoreのドキュメントを削除する非同期処理
 ****************************************************************************/
export const onDelete = functions
  .region('asia-northeast1')
  .auth.user()
  .onDelete(async (user) => {
    const uid = user.uid
    try {
      logger.log(`Authentications でユーザーアカウントが削除されました。`)

      logger.log(`従属する Users ドキュメントの削除処理を開始します。`)
      await User.deleteByUid(uid)
      logger.log(`従属する Users ドキュメントの削除処理が完了しました。`)
    } catch (err) {
      logger.error(
        `Authentications ユーザーアカウント削除時の処理でエラーが発生しました。UID: ${uid}`,
        err
      )
    }
  })
