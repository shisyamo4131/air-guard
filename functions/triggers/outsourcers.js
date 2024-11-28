/**
 * ## outsourcers.js
 *
 * Outsourcersドキュメントの作成・更新・削除トリガーに関する処理です。
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
} from '../modules/utils.js'
import { OutsourcerIndex } from '../models/Outsourcer.js'

/****************************************************************************
 * ドキュメントが作成されたときにトリガーされる関数。
 * - 作成されたドキュメントのデータを元に、Realtime Databaseにインデックスを作成します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 ****************************************************************************/
export const onCreate = onDocumentCreated(
  'Outsourcers/{docId}',
  async (event) => {
    const docId = event.params.docId

    // ログに更新されたドキュメントIDを含める
    logger.info(
      `Outsourcersドキュメントが更新されました。ドキュメントID: ${event.params.docId}`
    )

    try {
      // Realtime Databaseにインデックスを作成
      await OutsourcerIndex.create(docId)
    } catch (err) {
      // エラーハンドリング
      logger.error(
        `Outsourcersドキュメントの同期処理中にエラーが発生しました: ${err.message}`,
        { docId: event.params.docId }
      )
      throw err
    }
  }
)

/****************************************************************************
 * Outsourcerドキュメントの更新トリガーです。
 * - インデックスを更新します。
 * - 従属するドキュメントの outsourcer プロパティを同期します。
 *
 * #### 注意事項
 * - ドキュメントの内容に変更があったかどうかは`isDocumentChanged()`を利用します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 ****************************************************************************/
export const onUpdate = onDocumentUpdated(
  'Outsourcers/{docId}',
  async (event) => {
    try {
      // ドキュメントに変更がなければ処理を終了
      if (!isDocumentChanged(event)) return

      // ログに更新されたドキュメントIDを含める
      logger.info(
        `Outsourcersドキュメントが更新されました。ドキュメントID: ${event.params.docId}`
      )
      // Realtime Databaseにインデックスを更新
      const isChangedAsIndex = extractDiffsFromDocUpdatedEvent({
        event,
        ComparisonClass: OutsourcerIndex,
      })
      if (isChangedAsIndex.length > 0) {
        await OutsourcerIndex.create(event.params.docId)
      }
    } catch (err) {
      // エラーハンドリング
      logger.error(
        `Outsourcersドキュメントの同期処理中にエラーが発生しました: ${err.message}`,
        { docId: event.params.docId }
      )
      throw err
    }
  }
)

/****************************************************************************
 * ドキュメントが削除されたときにトリガーされる関数。
 * - インデックスを削除します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 ****************************************************************************/
export const onDelete = onDocumentDeleted(
  'Outsourcers/{docId}',
  async (event) => {
    const docId = event.params.docId

    // ログに更新されたドキュメントIDを含める
    logger.info(
      `Outsourcersドキュメントが削除されました。ドキュメントID: ${event.params.docId}`
    )

    try {
      // Realtime Databaseインデックスを削除
      await OutsourcerIndex.remove(docId)
    } catch (err) {
      // エラーハンドリング
      logger.error(
        `Outsourcersドキュメントの同期処理中にエラーが発生しました: ${err.message}`,
        { docId: event.params.docId }
      )
      throw err
    }
  }
)
