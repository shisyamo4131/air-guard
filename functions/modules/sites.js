const {
  // onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} = require('firebase-functions/v2/firestore')
// const { getFirestore } = require('firebase-admin/firestore')
const { info, error } = require('firebase-functions/logger')
const { getDatabase } = require('firebase-admin/database')
const {
  removeDependentDocuments,
  isDocumentChanged,
  syncDocuments,
} = require('./utils')
// const firestore = getFirestore()
const database = getDatabase()

// const BATCH_LIMIT = 500

/**
 * Siteドキュメントの更新トリガーです。
 * - ドキュメントの内容に変更があった場合に、従属するドキュメントのsiteプロパティを同期します。
 *
 * #### 注意事項
 * - ドキュメントの内容に変更があったかどうかは`isDocumentChanged()を利用します。
 * - ドキュメントの同期にはsyncDocuments()を利用します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-08-07 - 初版作成
 */
exports.onUpdate = onDocumentUpdated('Sites/{docId}', async (event) => {
  if (!isDocumentChanged(event)) return
  info('Siteドキュメントが更新されました。')
  // OperationResultsと同期
  await syncDocuments(
    `Sites/${event.params.docId}/OperationResults`,
    'siteId',
    'site',
    event.data.after.data()
  )
})

/**
 * Siteドキュメントの削除トリガーです。
 * - AirGuardとの同期設定を解除します。
 *
 * @author shisyamo4131
 * @version 1.2.0
 *
 * @updates
 * - version 1.2.0 - 2024-08-07 - OperationResultsの削除処理を追加。
 * - version 1.1.0 - 2024-07-12 - SiteOperationSchedulesの削除処理を追加。
 *                              - SiteContractsの削除処理を追加。
 * - version 1.0.0 - 2024-07-11 - 初版作成
 */
exports.onDelete = onDocumentDeleted('Sites/{docId}', async (event) => {
  info(`Siteドキュメントが削除されました。`)
  const docId = event.params.docId
  try {
    // 同期設定済みの取引先ドキュメントであれば同期を解除する
    if (event.data.data().sync) {
      const code = event.data.data().code
      await database.ref(`AirGuard/Sites/${code}`).update({ docId: null })
      info(`AirGuardとの同期設定を解除しました。。`)
    }
  } catch (err) {
    error(`Siteドキュメントの同期設定解除処理でエラーが発生しました。`, err)
  }
  try {
    // 従属するドキュメントを削除
    await removeDependentDocuments(`Sites/${docId}`, [
      'SiteOperationSchedules',
      'SiteContracts',
      'OperationResults',
    ])
    info('従属するドキュメントを削除しました。')
  } catch (err) {
    error(`Siteドキュメントの同期設定解除処理でエラーが発生しました。`, err)
  }
})
