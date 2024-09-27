/**
 * ## employees.js
 *
 * Employeesドキュメントの作成・更新・削除トリガーに関する処理です。
 *
 * ### 従属ドキュメントの同期削除について
 * 従属ドキュメントの同期削除は以下の理由で行いません。
 * - アプリの仕様上、従属するドキュメントが存在する場合、親ドキュメントは削除できません。
 * - ドキュメントの整合性を保つために従属するドキュメントも削除することを検討しましたが、
 *   アプリで実装している論理削除の設計を崩壊させてしまう為に取りやめました。
 */
import {
  onDocumentUpdated,
  onDocumentCreated,
  onDocumentDeleted,
} from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions/v2'
import { isDocumentChanged } from '../modules/utils.js'
import Employee from '../models/Employee.js'

/****************************************************************************
 * ドキュメントが作成されたときにトリガーされる関数。
 * - 作成されたドキュメントのデータを元に、Realtime Databaseにインデックスを作成します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 ****************************************************************************/
export const onCreate = onDocumentCreated(
  'Employees/{docId}',
  async (event) => {
    const docId = event.params.docId

    // ログに更新されたドキュメントIDを含める
    logger.info(
      `Employeesドキュメントが更新されました。ドキュメントID: ${event.params.docId}`
    )

    try {
      // Realtime Databaseにインデックスを作成
      await Employee.syncIndex(docId)
    } catch (err) {
      // エラーハンドリング
      logger.error(
        `Employeesドキュメントの同期処理中にエラーが発生しました: ${err.message}`,
        { docId: event.params.docId }
      )
      throw err
    }
  }
)

/****************************************************************************
 * ドキュメントの更新トリガーです。
 * - インデックスを更新します。
 * - 従属するドキュメントの `employee` プロパティを同期します。
 *
 * #### 注意事項
 * - ドキュメントの内容に変更があったかどうかは`isDocumentChanged()`を利用します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 ****************************************************************************/
export const onUpdate = onDocumentUpdated(
  'Employees/{docId}',
  async (event) => {
    try {
      // ドキュメントに変更がなければ処理を終了
      if (!isDocumentChanged(event)) return

      // ログに更新されたドキュメントIDを含める
      logger.info(
        `Employeesドキュメントが更新されました。ドキュメントID: ${event.params.docId}`
      )

      // Realtime Databaseにインデックスを作成
      await Employee.syncIndex(event.params.docId)

      // EmployeeContractsドキュメントのemployeeプロパティを同期
      await Employee.syncToEmployeeContracts(event.params.docId)
    } catch (err) {
      // エラーハンドリング
      logger.error(
        `Employeesドキュメントの同期処理中にエラーが発生しました: ${err.message}`,
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
  'Employees/{docId}',
  async (event) => {
    const docId = event.params.docId

    // ログに更新されたドキュメントIDを含める
    logger.info(
      `Employeesドキュメントが削除されました。ドキュメントID: ${event.params.docId}`
    )

    try {
      // Realtime Databaseインデックスを削除
      await Employee.syncIndex(docId, true)
    } catch (err) {
      // エラーハンドリング
      logger.error(
        `Employeesドキュメントの同期処理中にエラーが発生しました: ${err.message}`,
        { docId: event.params.docId }
      )
      throw err
    }
  }
)
