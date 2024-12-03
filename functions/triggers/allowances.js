/**
 * Allowancesドキュメントの作成・更新・削除トリガーに関する処理です。
 *
 * ### 機能概要
 * - ドキュメント更新時、従属ドキュメントとの同期処理を行います。
 */
import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { info, error } from 'firebase-functions/logger'
import { isDocumentChanged } from '../modules/utils.js'
import EmployeeContract from '../models/EmployeeContract.js'

/**
 * Allowancesドキュメントの更新トリガーです。
 */
export const onUpdate = onDocumentUpdated(
  'Allowances/{docId}',
  async (event) => {
    const docId = event.params.docId

    // ドキュメントに変更がない場合は処理を終了
    if (!isDocumentChanged(event)) return

    info(`Allowancesドキュメントが更新されました。docId: ${docId}`)

    try {
      // EmployeeContracts ドキュメントの allowances プロパティ（配列）を同期
      await EmployeeContract.refreshAllowance(event)
    } catch (err) {
      // エラーハンドリング：エラーログを出力し、処理を中断
      error(`Allowancesドキュメントの同期に失敗しました。docId: ${docId}`, err)
    }
  }
)
