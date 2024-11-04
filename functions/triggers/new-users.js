import { getAuth } from 'firebase-admin/auth'
import { onDocumentCreated } from 'firebase-functions/firestore'
import { logger } from 'firebase-functions/v2'
import User from '../models/User.js'
const auth = getAuth()

/**
 * NewUsers コレクションに新規ドキュメントが作成された時の処理です。
 * - Authentication に新しいユーザーアカウントを作成します。
 * - 同一メールアドレスのアカウントが既に存在している場合はエラーになります。
 * - Authentication に新しいユーザーアカウントが作成された後、Users コレクションにドキュメントを作成します。
 * - 処理の最後に NewUsers コレクションの該当ドキュメントを削除します。
 *
 * - ユーザーアカウント作成後にエラーが発生した場合、当該ユーザーアカウントは削除されます。
 */
export const onCreated = onDocumentCreated(
  `NewUsers/{docId}`,
  async (event) => {
    const userData = event.data.data()
    const { email, password, employeeId, displayName } = userData
    let uid = ''
    try {
      // Authentication に新しいユーザーアカウントを作成
      const userRecord = await auth.createUser({
        email,
        password,
        displayName,
      })

      // 作成したユーザーの uid を取得
      uid = userRecord.uid
      const userInstance = new User({ uid, email, displayName, employeeId })
      await userInstance.create({ docId: uid })
    } catch (error) {
      // ユーザーアカウントが作成されていた場合は削除
      if (uid) {
        await auth.deleteUser(uid)
      }
      logger.error('新規ユーザーの作成処理でエラーが発生しました。', error)
    } finally {
      // NewUsers コレクションの該当ドキュメントを削除
      await event.data.ref.delete()
    }
  }
)
