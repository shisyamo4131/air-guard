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
import {
  extractDiffsFromDocUpdatedEvent,
  isDocumentChanged,
} from '../modules/utils.js'
import { EmployeeIndex, EmployeeMinimal } from '../models/Employee.js'
import { EmployeeContractLatest } from '../models/EmployeeContract.js'

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

    logger.info(
      `Employeesドキュメントが更新されました。ドキュメントID: ${event.params.docId}`
    )

    try {
      /**
       * Realtime Database にインデックスを作成します。
       */
      await EmployeeIndex.create(docId)
      logger.info(`Employeeインデックスとの同期完了`)
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
 * @author shisyamo4131
 ****************************************************************************/
export const onUpdate = onDocumentUpdated(
  'Employees/{docId}',
  async (event) => {
    const employeeId = event.params.docId

    try {
      // ドキュメントに変更がなければ処理を終了
      if (!isDocumentChanged(event)) return

      // EmployeeIndex クラスを基準に変更の有無を確認
      const isChangedAsIndex = extractDiffsFromDocUpdatedEvent({
        event,
        ComparisonClass: EmployeeIndex,
      })

      // 変更があった場合はインデックスを更新
      if (isChangedAsIndex.length > 0) {
        await EmployeeIndex.create(event.params.docId)
      }

      // 従属ドキュメント（非同期ドキュメント）との同期処理
      const dependentCollections = [
        'EmployeeContracts',
        'HealthInsurances',
        'Pensions',
        'EmploymentInsurances',
        'MedicalCheckups',
      ]
      for (const collectionId of dependentCollections) {
        await EmployeeMinimal.sync(event, collectionId)
      }

      // status が更新された場合は最新の雇用契約情報を同期
      if (event.data.before.data().status !== event.data.after.data().status) {
        await EmployeeContractLatest.sync(employeeId)
      }
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
 * @author shisyamo4131
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
      /**
       * Realtime Database からインデックスを削除します。
       */
      await EmployeeIndex.remove(docId)
      logger.info(`Employeeインデックスとの同期完了`)
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
