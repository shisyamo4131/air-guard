/**
 * ## operation-work-results.js
 *
 * 従業員稼働実績ドキュメントのトリガー定義
 *
 * @author shisyamo4131
 */

import { onDocumentDeleted } from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions/v2'
import { EmployeeSiteHistory } from '../models/EmployeeSiteHistory.js'
import { SiteEmployeeHistory } from '../models/SiteEmployeeHistory.js'

/****************************************************************************
 * 削除トリガー
 * - OperationWorkResults ドキュメント削除時に従業員現場履歴を更新します。
 ****************************************************************************/
export const onDelete = onDocumentDeleted(
  'OperationWorkResults/{docId}',
  async (event) => {
    const { employeeId, siteId, operationResultId } = event.data.data()

    try {
      logger.info(
        `従業員稼働実績 (OperationWorkResults ドキュメント) が削除されました。従業員ID: ${employeeId}, 現場ID: ${siteId}, OperationResultID: ${operationResultId}`
      )
      // 従業員現場履歴を更新
      await EmployeeSiteHistory.updateByEmployeeId({ employeeId, siteId })
      // 従業員入場履歴を更新
      await SiteEmployeeHistory.updateBySiteId({ siteId, employeeId })
    } catch (err) {
      // エラーログを詳細化
      logger.error(
        `従業員稼働実績 (OperationWorkResults ドキュメント) の削除処理中にエラーが発生しました。従業員ID: ${employeeId}, 現場ID: ${siteId}, OperationResultID: ${operationResultId}`,
        {
          message: err.message,
          stack: err.stack,
        }
      )
    }
  }
)
