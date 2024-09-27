import {
  onDocumentDeleted,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions/v2'
import { getDatabase } from 'firebase-admin/database'
import {
  removeDependentDocuments,
  isDocumentChanged,
  syncDependentDocuments,
} from '../modules/utils.js'

const database = getDatabase()

/**
 * `Sites` ドキュメントと同期されるべきコレクションの定義
 * - 更新されたドキュメントの `docId` と更新対象ドキュメントの `siteId` が比較されます。
 * - ドキュメントの内の `site` プロパティが更新されます。
 * - `siteId` を持つものの `site` プロパティを持たないドキュメントは個別に同期削除する必要があります。
 */
const collectionsToSyncAndRemove = ['SiteContracts', 'OperationResults']

/****************************************************************************
 * Siteドキュメントの更新トリガーです。
 * - ドキュメントの内容に変更があった場合に、従属するドキュメントのsiteプロパティを同期します。
 *
 * @version 1.0.0
 * @updates
 * - version 1.1.0 - 2024-09-23 - ドキュメント変更の有無の確認で`hasContract`を除外
 * - version 1.0.0 - 2024-08-07 - 初版作成
 ****************************************************************************/
export const onUpdate = onDocumentUpdated('Sites/{docId}', async (event) => {
  // 更新情報以外の変更があったかを確認 -> 変更がなければ終了
  if (!isDocumentChanged(event)) return

  // docIdを取得しておく
  const docId = event.params.docId

  // ドキュメントが変更されたことを通知
  logger.info(`Sitesドキュメントが更新されました。`, { docId })

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

    // 処理終了を通知
    logger.info('従属するすべてのドキュメントの同期が完了しました。')
  } catch (err) {
    logger.error('Siteドキュメントの同期中にエラーが発生しました。', err)
  }
})

/****************************************************************************
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
 ****************************************************************************/
export const onDelete = onDocumentDeleted('Sites/{docId}', async (event) => {
  const docId = event.params.docId
  logger.info(`Siteドキュメントが削除されました。docId: ${docId}`)

  /**
   * AirGuardとの同期設定済みドキュメントであれば同期を解除する。
   */
  try {
    const siteData = event.data.data()
    if (siteData.sync) {
      const code = siteData.code
      await database.ref(`AirGuard/Sites/${code}`).update({ docId: null })
      logger.info(`AirGuardとの同期設定を解除しました。code: ${code}`)
    }
  } catch (err) {
    logger.error(`AirGuardとの同期設定解除処理でエラーが発生しました。`, err)
  }

  /**
   * 従属するドキュメントをすべて削除する。
   */
  try {
    // 削除対象に`SiteOperationSchedules`を追加
    const allCollectionsToRemove = [
      ...collectionsToSyncAndRemove,
      'SiteOperationSchedules',
    ]
    await removeDependentDocuments(allCollectionsToRemove, 'siteId', docId)
    logger.info('従属するドキュメントを削除しました。')
  } catch (err) {
    logger.error(`従属するドキュメントの削除処理でエラーが発生しました。`, err)
  }
})
