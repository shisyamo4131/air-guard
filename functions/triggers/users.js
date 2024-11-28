import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} from 'firebase-functions/firestore'
import { logger } from 'firebase-functions/v2'
const auth = getAuth()
const firestore = getFirestore()

/**
 * Users コレクションドキュメントが作成された時の処理です。
 * - docId ( = uid ) に該当する Authentications ユーザーアカウントを有効化します。
 *
 * NOTE:
 * - Users コレクションドキュメントが作成されるタイミングは以下の2パターンです。
 *   1. NewUsers コレクションドキュメントが作成されたことによる Cloud Functions の同期処理
 *      新規ユーザーの作成処理フローによるものです。既に有効化されたアカウントを再度有効化することになります。
 *   2. 論理削除された Users コレクションドキュメントのリストア
 *      無効化された Authentications アカウントを有効化することになります。
 */
export const onCreate = onDocumentCreated(`Users/{docId}`, async (event) => {
  const uid = event.params.docId
  try {
    // uid に該当するユーザーアカウントを有効にする
    await auth.updateUser(uid, { disabled: false })
  } catch (error) {
    const message = 'Auth ユーザーアカウントの有効化処理に失敗しました。'
    logger.error(message, { uid, error })
  }
})

/**
 * Users コレクションドキュメントが更新された時の処理です。
 * - isAdmin, isDeveloper の値に応じて権限の設定を行います。
 */
export const onUpdate = onDocumentUpdated(`Users/{docId}`, async (event) => {
  const uid = event.params.docId
  const { isAdmin, isDeveloper, isManager } = event.data.after.data()

  // Firestoreの参照を取得
  const adminRef = firestore.collection('admin_users').doc(uid)
  const developerRef = firestore.collection('developer_users').doc(uid)
  const managerRef = firestore.collection('manager_users').doc(uid)

  try {
    // isAdmin の値に応じて admin_users コレクションを更新または削除
    if (isAdmin) {
      await adminRef.set({ uid })
    } else {
      await adminRef.delete()
    }

    // isDeveloper の値に応じて developer_users コレクションを更新または削除
    if (isDeveloper) {
      await developerRef.set({ uid })
    } else {
      await developerRef.delete()
    }

    // isManager の値に応じて manager_users コレクションを更新または削除
    if (isManager) {
      await managerRef.set({ uid })
    } else {
      await managerRef.delete()
    }
  } catch (error) {
    // エラーログを記録
    logger.error('権限の設定変更処理でエラーが発生しました。', {
      error,
      uid,
    })
  }
})

/****************************************************************************
 * Users コレクションドキュメントが削除された時の処理です。
 * - docId ( = uid ) に該当する Authentications ユーザーアカウントを無効化します。
 * - Authentications でユーザーアカウントが削除されると Users ドキュメントも削除されます。
 *   該当するユーザーアカウントが見つからなかった場合はログを出力して終了します。
 ****************************************************************************/
export const onDelete = onDocumentDeleted(`Users/{docId}`, async (event) => {
  const uid = event.params.docId
  try {
    logger.log(`Users ドキュメントが削除されました。`)

    logger.log(`Authentications ユーザーアカウントの無効化処理を開始します。`)
    await auth.updateUser(uid, { disabled: true })
    logger.log(`Authentications ユーザーアカウントの無効化処理が完了しました。`)
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      logger.log(`該当するユーザーアカウントが存在しませんでした。`, { uid })
    } else {
      const message = 'Auth ユーザーアカウントの無効化処理に失敗しました。'
      logger.error(message, { uid, error })
    }
  }
})
