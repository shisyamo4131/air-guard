const {
  onDocumentUpdated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const { info } = require('firebase-functions/logger')
const { getDatabase } = require('firebase-admin/database')
const { isDocumentChanged, syncDocuments } = require('./utils')
const database = getDatabase()

/**
 * Customerドキュメントの更新トリガーです。
 * - ドキュメントの内容に変更があった場合に、従属するSiteドキュメントのcustomerプロパティを同期します。
 *
 * #### 注意事項
 * - ドキュメントの内容に変更があったかどうかは`isDocumentChanged()を利用します。
 * - ドキュメントの同期にはsyncDocuments()を利用します。
 *
 * #### 更新履歴
 * - version 1.0.0 - 2024-07-10 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.0.0
 */
exports.onUpdate = onDocumentUpdated('Customers/{docId}', async (event) => {
  // ドキュメント内容に変更があった場合のみ同期を行います。
  if (isDocumentChanged(event)) {
    info('Customerドキュメントが更新されました。')
    await syncDocuments('Sites', 'customer', event.data.after.data())
  }
})

/**
 * Customerドキュメントの削除トリガーです。
 * - AirGuardとの同期設定を解除します。
 *
 * #### 更新履歴
 * - version 1.0.0 - 2024-07-10 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.0.0
 */
exports.onDelete = onDocumentDeleted('Customers/{docId}', async (event) => {
  // 同期設定済みの取引先ドキュメントであれば同期を解除する
  if (event.data.data().sync) {
    const code = event.data.data().code
    await database.ref(`AirGuard/Customers/${code}`).update({ docId: null })
  }
})
