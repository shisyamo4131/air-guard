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

import functions from 'firebase-functions'
import User from '../models/User.js'

/****************************************************************************
 * Firebase Authenticationでユーザーが作成されたときに呼び出される関数です。
 * 新しく作成されたユーザーに対応するFirestoreの`Users`コレクションにドキュメントを作成します。
 *
 * @param {Object} user - 作成されたユーザーの情報（UIDなどが含まれています）
 * @returns {Promise<void>} Firestoreにドキュメントを作成する非同期処理
 ****************************************************************************/
export const onCreate = functions
  .region('asia-northeast1')
  .auth.user()
  .onCreate(async (user) => {
    const uid = user.uid
    const instance = new User({ uid })
    try {
      // Firestoreに新しいユーザードキュメントを作成
      await instance.create({ docId: uid })
      functions.logger.info(
        `User created and Firestore document created for UID: ${uid}`
      )
    } catch (err) {
      // Firestoreドキュメント作成時のエラー処理
      functions.logger.error(
        `Error creating Firestore document for UID: ${uid}`,
        err
      )
    }
  })

/****************************************************************************
 * Firebase Authenticationでユーザーが削除されたときに呼び出される関数です。
 * 削除されたユーザーに対応するFirestoreの`Users`コレクションのドキュメントを削除します。
 *
 * @param {Object} user - 削除されたユーザーの情報（UIDなどが含まれています）
 * @returns {Promise<void>} Firestoreのドキュメントを削除する非同期処理
 ****************************************************************************/
export const onDelete = functions
  .region('asia-northeast1')
  .auth.user()
  .onDelete(async (user) => {
    const uid = user.uid
    const instance = new User()
    try {
      await instance.fetch(uid)
      // Firestoreの対応するユーザードキュメントを削除
      await instance.delete()
      functions.logger.info(`Firestore document deleted for UID: ${uid}`)
    } catch (err) {
      // Firestoreドキュメント削除時のエラー処理
      functions.logger.error(
        `Error deleting Firestore document for UID: ${uid}`,
        err
      )
    }
  })
