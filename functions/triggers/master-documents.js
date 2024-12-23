/**
 * マスタドキュメントと従属ドキュメントの非正規化されたデータを同期します。
 *
 * - DOCUMENT_SYNC_DEFINISIONS に定義された内容に従って、従属ドキュメントの非正規化データを同期します。
 * - 更新トリガーがすべてのコレクションドキュメントに対して反応することになりますが、
 *   毎月200万回の呼び出しまでは無料枠で利用可能なため、実装効率を重視しました。
 *
 * @author shisyamo4131
 */
import { onDocumentUpdated } from 'firebase-functions/firestore'
import { logger } from 'firebase-functions/v2'

import {
  extractDiffsFromDocUpdatedEvent, // 指定されたクラスで更新前後のデータを比較して更新された情報を返す関数
  isDocumentChanged, // 更新情報以外にドキュメント内容が変更変更されたかどうかを返す関数
  syncDependentDocumentsV2, // 従属ドキュメントの非正規化されたデータを同期するための関数
} from '../modules/utils.js'

// 変更有無を確認するためデータの比較に使用するクラス
import { CustomerMinimal } from '../models/Customer.js'
import { SiteMinimal } from '../models/Site.js'
import { EmployeeMinimal } from '../models/Employee.js'
import { WorkRegulationMinimal } from '../models/WorkRegulation.js'

/*****************************************************************************
 * コレクション間の同期定義
 *****************************************************************************/
const DOCUMENT_SYNC_DEFINITIONS = {
  // 取引先
  Customers: {
    // 取引先 -> 現場
    Sites: {
      updateProp: 'customer',
      compareProp: 'customerId',
      ComparisonClass: CustomerMinimal,
    },
  },

  // 従業員
  Employees: {
    // 従業員 -> 雇用契約
    EmployeeContracts: {
      updateProp: 'employee',
      compareProp: 'employeeId',
      ComparisonClass: EmployeeMinimal,
    },

    // 従業員 -> 健康保険
    HealthInsurances: {
      updateProp: 'employee',
      compareProp: 'employeeId',
      ComparisonClass: EmployeeMinimal,
    },

    // 従業員 -> 厚生年金
    Pensions: {
      updateProp: 'employee',
      compareProp: 'employeeId',
      ComparisonClass: EmployeeMinimal,
    },

    // 従業員 -> 雇用保険
    EmploymentInsurances: {
      updateProp: 'employee',
      compareProp: 'employeeId',
      ComparisonClass: EmployeeMinimal,
    },

    // 従業員 -> 健康診断
    MedicalCheckups: {
      updateProp: 'employee',
      compareProp: 'employeeId',
      ComparisonClass: EmployeeMinimal,
    },
  },

  // 現場
  Sites: {
    // 現場 -> 現場取極め
    SiteContracts: {
      updateProp: 'site',
      compareProp: 'siteId',
      ComparisonClass: SiteMinimal,
    },

    // 現場 -> 稼働実績
    OperationResults: {
      updateProp: 'site',
      compareProp: 'siteId',
      ComparisonClass: SiteMinimal,
    },
  },

  // 就業規則
  WorkRegulations: {
    // 就業規則 -> 雇用契約
    EmployeeContracts: {
      updateProp: 'workRegulation',
      compareProp: 'workRegulationId',
      ComparisonClass: WorkRegulationMinimal,
    },
  },
}

/*****************************************************************************
 * ドキュメント更新トリガー
 *****************************************************************************/
export const onUpdate = onDocumentUpdated(
  `{updatedCollectionId}/{docId}`,
  async (event) => {
    // 更新情報（タイムスタンプなど）以外に変更がなければ終了
    if (!isDocumentChanged(event)) return

    const { updatedCollectionId, docId } = event.params

    // 更新されたコレクションの同期定義を取得
    const definitions = DOCUMENT_SYNC_DEFINITIONS[updatedCollectionId]

    // 定義が存在しない場合は終了
    if (!definitions) return

    try {
      // 同期処理を直列で実行
      for (const [collectionId, defs] of Object.entries(definitions)) {
        const { updateProp, compareProp, ComparisonClass } = defs

        // 差分を取得
        const differences = extractDiffsFromDocUpdatedEvent({
          event,
          ComparisonClass,
        })

        if (differences.length === 0) {
          const message = `[onUpdate] No differences found for collection: ${collectionId}`
          logger.info(message)
          continue
        }

        // 差分がある場合に同期処理を実行
        await syncDependentDocumentsV2({
          collectionId,
          updateProp,
          afterData: differences.data,
          conditions: [[compareProp, '==', docId]],
        })

        const message = `[onUpdate] Synced documents in collection: ${collectionId}`
        logger.log(message)
      }
    } catch (error) {
      logger.error(`[onUpdate] Error syncing dependent documents:`, error)
    }
  }
)
