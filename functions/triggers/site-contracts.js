import {
  onDocumentCreated,
  onDocumentDeleted,
} from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions/v2'
import Site from '../models/Site.js'

/****************************************************************************
 * Firestoreドキュメント作成時のトリガー
 * - `SiteContracts` コレクションにドキュメントが作成されると発火。
 * - 関連する `Site` ドキュメントの `hasContract` フィールドを `true` に更新します。
 * @param {Object} event - Firestoreイベントオブジェクト
 ****************************************************************************/
export const onCreate = onDocumentCreated(
  'SiteContracts/{docId}',
  async (event) => {
    const docId = event.params.docId
    const data = event.data.data()
    const siteId = data?.siteId

    if (!siteId) {
      logger.error(
        `Failed to retrieve siteId from the created document. docId: ${docId}`
      )
      return
    }

    try {
      // 関連するSiteドキュメントのhasContractフィールドを更新
      await Site.refreshHasContract(siteId)
      logger.info(
        `Successfully updated hasContract for siteId: ${siteId} after creation of docId: ${docId}`
      )
    } catch (err) {
      logger.error(
        `An error occurred while updating hasContract after creation. docId: ${docId}, siteId: ${siteId}, Error: ${err.message}, Stack: ${err.stack}`
      )
    }
  }
)

/****************************************************************************
 * Firestoreドキュメント削除時のトリガー
 * - `SiteContracts` コレクションからドキュメントが削除されると発火。
 * - 同じ `siteId` に関連する他の契約がない場合、対応する `Site` ドキュメントの `hasContract` フィールドを `false` に更新します。
 * @param {Object} event - Firestoreイベントオブジェクト
 ****************************************************************************/
export const onDelete = onDocumentDeleted(
  'SiteContracts/{docId}',
  async (event) => {
    const docId = event.params.docId
    const data = event.data.data()
    const siteId = data?.siteId

    if (!siteId) {
      logger.error(
        `Failed to retrieve siteId from the deleted document. docId: ${docId}`
      )
      return
    }

    try {
      // 関連するSiteドキュメントのhasContractフィールドを更新
      await Site.refreshHasContract(siteId)
      logger.info(
        `Successfully updated hasContract for siteId: ${siteId} after deletion of docId: ${docId}`
      )
    } catch (err) {
      logger.error(
        `An error occurred while updating hasContract after deletion. docId: ${docId}, siteId: ${siteId}, Error: ${err.message}, Stack: ${err.stack}`
      )
    }
  }
)
