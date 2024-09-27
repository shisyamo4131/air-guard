/**
 * ## customer.js
 *
 * Customerドキュメントの更新トリガーに関する処理です。
 *
 * - `Customers` ドキュメントが削除された時の処理は実装しません。
 *   アプリの仕様上、従属するドキュメントが存在する場合、親ドキュメントは削除できません。
 *   ドキュメントの整合性を保つために従属するドキュメントも削除することを検討しましたが、
 *   アプリで実装している論理削除の設計を崩壊させてしまうため、取りやめました。
 */
import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions/v2'
import { isDocumentChanged } from '../modules/utils.js'
import Customer from '../models/Customer.js'

/****************************************************************************
 * Customerドキュメントの更新トリガーです。
 * - 従属する Site ドキュメントの customer プロパティを同期します。
 *
 * #### 注意事項
 * - ドキュメントの内容に変更があったかどうかは`isDocumentChanged()`を利用します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 ****************************************************************************/
export const onUpdate = onDocumentUpdated(
  'Customers/{docId}',
  async (event) => {
    try {
      // ドキュメントに変更がなければ処理を終了
      if (!isDocumentChanged(event)) return

      // ログに更新されたドキュメントIDを含める
      logger.info(
        `Customerドキュメントが更新されました。ドキュメントID: ${event.params.docId}`
      )

      // Siteドキュメントのcustomerプロパティを同期
      await Customer.syncToSite(event.params.docId)
    } catch (err) {
      // エラーハンドリング
      logger.error(
        `Customerドキュメントの同期処理中にエラーが発生しました: ${err.message}`,
        { docId: event.params.docId }
      )
      throw err
    }
  }
)
