/**
 * EmployeeContracts ドキュメントのトリガー定義
 */
import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} from 'firebase-functions/firestore'
import { logger } from 'firebase-functions'
import { EmployeeContractLatest } from '../models/EmployeeContract.js'

/*****************************************************************************
 * ドキュメント作成時
 *****************************************************************************/
export const onCreate = onDocumentCreated(
  'EmployeeContracts/{docId}',
  async (event) => {
    const employeeId = event.data.data().employeeId
    try {
      // 従業員別最新雇用契約データの同期
      await syncLatestEmployeeContract(employeeId)
    } catch (error) {
      logger.error(
        `EmployeeContractドキュメントの作成トリガーでエラーが発生しました。`,
        { error }
      )
    }
  }
)

/*****************************************************************************
 * ドキュメント更新時
 *****************************************************************************/
export const onUpdate = onDocumentUpdated(
  'EmployeeContracts/{docId}',
  async (event) => {
    const employeeId = event.data.after.data().employeeId
    try {
      // 従業員別最新雇用契約データの同期
      await syncLatestEmployeeContract(employeeId)
    } catch (error) {
      logger.error(
        `EmployeeContractドキュメントの更新トリガーでエラーが発生しました。`,
        { error }
      )
    }
  }
)

/*****************************************************************************
 * ドキュメント削除時
 *****************************************************************************/
export const onDelete = onDocumentDeleted(
  'EmployeeContracts/{docId}',
  async (event) => {
    const employeeId = event.data.data().employeeId
    try {
      // 従業員別最新雇用契約データの同期
      await syncLatestEmployeeContract(employeeId)
    } catch (error) {
      logger.error(
        `EmployeeContractドキュメントの削除トリガーでエラーが発生しました。`,
        { error }
      )
    }
  }
)

async function syncLatestEmployeeContract(employeeId) {
  await EmployeeContractLatest.sync(employeeId)
  logger.log(
    `従業員別最新雇用契約データとの同期処理が完了しました。従業員ID: ${employeeId}`
  )
}
