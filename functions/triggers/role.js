import { getAuth } from 'firebase-admin/auth'
import { logger } from 'firebase-functions/v2'
import {
  onDocumentCreated,
  onDocumentDeleted,
} from 'firebase-functions/v2/firestore'
const auth = getAuth()

/**
 * addAdminClaim
 */
export const addAdminClaim = onDocumentCreated(
  'admin_users/{docID}',
  async (event) => {
    const newAdminUser = event.data.data()
    if (newAdminUser === undefined) return
    await modifyRole(newAdminUser.uid, 'admin', true)
  }
)

/**
 * removeAdminClaim
 */
export const removeAdminClaim = onDocumentDeleted(
  'admin_users/{docID}',
  async (event) => {
    const deletedAdminUser = event.data.data()
    if (deletedAdminUser === undefined) return
    await modifyRole(deletedAdminUser.uid, 'admin', false)
  }
)

/**
 * addDeveloperClaim
 */
export const addDeveloperClaim = onDocumentCreated(
  'developer_users/{docID}',
  async (event) => {
    const newDeveloperUser = event.data.data()
    if (newDeveloperUser === undefined) return
    await modifyRole(newDeveloperUser.uid, 'developer', true)
  }
)

/**
 * removeDeveloperClaim
 */
export const removeDeveloperClaim = onDocumentDeleted(
  'developer_users/{docID}',
  async (event) => {
    const deletedDeveloperUser = event.data.data()
    if (deletedDeveloperUser === undefined) return
    await modifyRole(deletedDeveloperUser.uid, 'developer', false)
  }
)

/**
 * modifyRole
 * @param {string} uid
 * @param {object} role
 */
async function modifyRole(uid, key, value) {
  try {
    // uid から Auth ユーザーを取得 -> 取得できなければ警告を出力
    const user = await auth.getUser(uid).catch(() => {
      const message =
        '指定された uid による Authentication ユーザーデータを取得できませんでした。Authentication ユーザーが削除された場合にこの警告は無視して構いません。'
      logger.warn(message, { function: 'modifyRole', uid })
      return undefined // 明示的に undefined を返す
    })

    if (!user) return // user が存在しない場合は終了

    // 変更前の customClaims.roles を取得
    let roles = user.customClaims?.roles || []

    // key を追加または削除
    if (value) {
      roles.push(key)
    } else {
      roles = roles.filter((item) => item !== key)
    }

    // 重複を削除して新しい roles を作成
    const newRoles = Array.from(new Set(roles))

    // 新しい roles を設定
    await auth.setCustomUserClaims(uid, { roles: newRoles })

    logger.info(`権限の変更処理が正常に完了しました。`, { uid, key, value })
  } catch (error) {
    logger.error('権限の変更処理でエラーが発生しました。', {
      error,
      function: 'modifyRole',
      uid,
    })
  }
}
