/**
 * ## sites.js
 *
 * Sitesドキュメントの作成・更新・削除トリガーに関する処理です。
 *
 * ### 従属ドキュメントの同期削除について
 * 従属ドキュメントの同期削除は以下の理由で行いません。
 * - アプリの仕様上、従属するドキュメントが存在する場合、親ドキュメントは削除できません。
 * - ドキュメントの整合性を保つために従属するドキュメントも削除することを検討しましたが、
 *   アプリで実装している論理削除の設計を崩壊させてしまう為に取りやめました。
 */
import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions/v2'
import {
  extractDiffsFromDocUpdatedEvent,
  isDocumentChanged,
  removeDependentDocuments,
} from '../modules/utils.js'
import { SiteIndex } from '../models/Site.js'
import SiteContract from '../models/SiteContract.js'
import OperationResult from '../models/OperationResult.js'

/****************************************************************************
 * ドキュメントが作成されたときにトリガーされる関数。
 * - 作成されたドキュメントのデータを元に、Realtime Databaseにインデックスを作成します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 ****************************************************************************/
export const onCreate = onDocumentCreated('Sites/{docId}', async (event) => {
  const docId = event.params.docId

  // ログに更新されたドキュメントIDを含める
  logger.info(
    `Sitesドキュメントが更新されました。ドキュメントID: ${event.params.docId}`
  )

  try {
    // Realtime Databaseにインデックスを作成
    await SiteIndex.create(docId)
  } catch (err) {
    // エラーハンドリング
    logger.error(
      `Sitesドキュメントの同期処理中にエラーが発生しました: ${err.message}`,
      { docId: event.params.docId }
    )
    throw err
  }
})

/****************************************************************************
 * ドキュメントの更新トリガーです。
 * - インデックスを更新します。
 * - 従属するドキュメントのsiteプロパティを同期します。
 *
 * #### 注意事項
 * - ドキュメントの内容に変更があったかどうかは`isDocumentChanged()`を利用します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 ****************************************************************************/
export const onUpdate = onDocumentUpdated('Sites/{docId}', async (event) => {
  try {
    // ドキュメントに変更がなければ処理を終了
    if (!isDocumentChanged(event)) return

    // ログに更新されたドキュメントIDを含める
    logger.info(
      `Sitesドキュメントが更新されました。ドキュメントID: ${event.params.docId}`
    )

    // Realtime Databaseにインデックスを更新
    const isChangedAsIndex = extractDiffsFromDocUpdatedEvent({
      event,
      ComparisonClass: SiteIndex,
    })
    if (isChangedAsIndex.length > 0) {
      await SiteIndex.create(event.params.docId)
    }

    // SiteContractsドキュメントのsiteプロパティを同期
    logger.log(`SiteContracts ドキュメントとの同期処理を開始します。`)
    await SiteContract.refreshSite(event)
    logger.log(`SiteContracts ドキュメントとの同期処理が完了しました。`)

    // OperationResultsドキュメントのsiteプロパティを同期
    logger.log(`OperationResults ドキュメントとの同期処理を開始します。`)
    await OperationResult.refreshSite(event)
    logger.log(`OperationResults ドキュメントとの同期処理が完了しました。`)
  } catch (err) {
    // エラーハンドリング
    logger.error(
      `Sitesドキュメントの同期処理中にエラーが発生しました: ${err.message}`,
      { docId: event.params.docId }
    )
    throw err
  }
})

/****************************************************************************
 * ドキュメントが削除されたときにトリガーされる関数。
 * - インデックスを削除します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 ****************************************************************************/
export const onDelete = onDocumentDeleted('Sites/{docId}', async (event) => {
  const docId = event.params.docId

  // ログに更新されたドキュメントIDを含める
  logger.info(
    `Sitesドキュメントが削除されました。ドキュメントID: ${event.params.docId}`
  )

  try {
    // Realtime Databaseインデックスを削除
    await SiteIndex.remove(docId)

    // 従属する現場取極め, 現場稼働予定を削除
    await removeDependentDocuments(
      ['SiteContracts', 'SiteOperationSchedules'],
      'siteId',
      docId
    )
  } catch (err) {
    // エラーハンドリング
    logger.error(
      `Sitesドキュメントの同期処理中にエラーが発生しました: ${err.message}`,
      { docId: event.params.docId }
    )
    throw err
  }
})
