import { getAuth } from 'firebase-admin/auth'
import {
  onDocumentCreated,
  onDocumentDeleted,
} from 'firebase-functions/firestore'
import { logger } from 'firebase-functions/v2'
const auth = getAuth()

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
 * Users コレクションドキュメントが削除された時の処理です。
 * - docId ( = uid ) に該当する Authentications ユーザーアカウントを無効化します。
 */
export const onDelete = onDocumentDeleted(`Users/{docId}`, async (event) => {
  const uid = event.params.docId
  try {
    // uid に該当するユーザーアカウントを無効にする
    await auth.updateUser(uid, { disabled: true })
  } catch (error) {
    const message = 'Auth ユーザーアカウントの無効化処理に失敗しました。'
    logger.error(message, { uid, error })
  }
})
