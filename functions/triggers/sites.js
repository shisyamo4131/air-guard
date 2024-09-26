import {
  onDocumentDeleted,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore'
import { info, error } from 'firebase-functions/logger'
import { getDatabase } from 'firebase-admin/database'
import {
  removeDependentDocuments,
  isDocumentChanged,
  syncDependentDocuments,
} from '../modules/utils.js'

const database = getDatabase()

// siteドキュメントの同期対象コレクション
// `site`プロパティを持たないドキュメントの削除処理は個別に行う。
const collectionsToSyncAndRemove = ['SiteContracts', 'OperationResults']

/**
 * Siteドキュメントの更新トリガーです。
 * - ドキュメントの内容に変更があった場合に、従属するドキュメントのsiteプロパティを同期します。
 *
 * @version 1.0.0
 * @updates
 * - version 1.1.0 - 2024-09-23 - ドキュメント変更の有無の確認で`hasContract`を除外
 * - version 1.0.0 - 2024-08-07 - 初版作成
 */
export const onUpdate = onDocumentUpdated('Sites/{docId}', async (event) => {
  // ドキュメントの変更有無を確認
  const ignoreFields = ['hasContract']
  if (!isDocumentChanged(event, ignoreFields)) return

  info('Siteドキュメントが更新されました。')

  const updatedSiteData = event.data.after.data()

  try {
    // ループ処理でsyncDependentDocumentsを呼び出す
    for (const collection of collectionsToSyncAndRemove) {
      await syncDependentDocuments(
        collection,
        'siteId',
        'site',
        updatedSiteData
      )
    }

    info('従属するすべてのドキュメントの同期が完了しました。')
  } catch (err) {
    // eslint-disable-next-line no-console
    error('Siteドキュメントの同期中にエラーが発生しました。', err)
  }
})

/**
 * Siteドキュメントの削除トリガーです。
 * - AirGuardとの同期設定を解除します。
 * - 従属するドキュメントを削除します。
 *
 * @version 1.2.0
 * @updates
 * - version 1.2.0 - 2024-08-07 - OperationResultsの削除処理を追加。
 * - version 1.1.0 - 2024-07-12 - SiteOperationSchedulesの削除処理を追加。
 *                              - SiteContractsの削除処理を追加。
 * - version 1.0.0 - 2024-07-11 - 初版作成
 */
export const onDelete = onDocumentDeleted('Sites/{docId}', async (event) => {
  const docId = event.params.docId
  info(`Siteドキュメントが削除されました。docId: ${docId}`)

  try {
    // 同期設定済みの取引先ドキュメントであれば同期を解除する
    const siteData = event.data.data()
    if (siteData.sync) {
      const code = siteData.code
      await database.ref(`AirGuard/Sites/${code}`).update({ docId: null })
      info(`AirGuardとの同期設定を解除しました。code: ${code}`)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    error(`AirGuardとの同期設定解除処理でエラーが発生しました。`, err)
  }

  try {
    // 削除対象に`SiteOperationSchedules`を追加
    const allCollectionsToRemove = [
      ...collectionsToSyncAndRemove,
      'SiteOperationSchedules',
    ]
    await removeDependentDocuments(allCollectionsToRemove, 'siteId', docId)
    info('従属するドキュメントを削除しました。')
  } catch (err) {
    // eslint-disable-next-line no-console
    error(`従属するドキュメントの削除処理でエラーが発生しました。`, err)
  }
})
