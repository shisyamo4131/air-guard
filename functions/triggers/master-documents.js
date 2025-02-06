/**
 * Firestore ドキュメントの作成・更新・削除トリガーを利用した各種処理を定義しています。
 *
 * [ドキュメントの作成・更新・削除時の処理]
 * COLLECTION_HANDLERS にドキュメントが作成・更新・削除された時の処理を設定します。
 * 非正規化されたデータの同期更新についてはここで行う必要はありません。
 *
 * [コレクション間の同期]
 * マスタドキュメントが更新された際、非正規化されたデータを同期させることができます。
 * DOCUMENT_SYNC_DEFINISIONS に同期条件を設定します。
 *
 * 最後に、トリガーを実装する対象コレクションを登録します。
 *
 * @author shisyamo4131
 * @refact 2025-02-06
 */
import { onDocumentWritten } from 'firebase-functions/firestore'
import { logger } from 'firebase-functions/v2'

import {
  extractDiffsFromDocUpdatedEvent, // 指定されたクラスで更新前後のデータを比較して更新された情報を返す関数
  isDocumentChanged,
  removeDependentDocuments, // 更新情報以外にドキュメント内容が変更変更されたかどうかを返す関数
  syncDependentDocumentsV2, // 従属ドキュメントの非正規化されたデータを同期するための関数
} from '../modules/utils.js'

// 変更有無を確認するためデータの比較に使用するクラス
import { CustomerIndex } from '../models/Customer.js'
import Site, { SiteIndex } from '../models/Site.js'
import { EmployeeMinimal } from '../models/Employee.js'
import SiteContract from '../models/SiteContract.js'
import { fetchCoordinates } from '../modules/utils/geocoding.js'
import OperationResult from '../models/OperationResult.js'
import EmployeeContract from '../models/EmployeeContract.js'
import SiteOperationSchedule from '../models/SiteOperationSchedule.js'

/*****************************************************************************
 * コレクション毎の個別処理定義
 *****************************************************************************/
const COLLECTION_HANDLERS = {
  Customers: {
    CREATED: async (event) => {
      // Realtime Database にインデックスを作成
      await CustomerIndex.create(event.params.docId)
    },
    UPDATED: async (event) => {
      // Realtime Database のインデックスを更新
      const isChangedAsIndex = extractDiffsFromDocUpdatedEvent({
        event,
        ComparisonClass: CustomerIndex,
      })
      if (isChangedAsIndex.length > 0) {
        await CustomerIndex.create(event.params.docId)
      }
    },
    DELETED: async (event) => {
      // Realtime Databaseインデックスを削除
      await CustomerIndex.remove(event.params.docId)
    },
  },
  Sites: {
    CREATED: async (event) => {
      // Realtime Database にインデックスを作成
      await SiteIndex.create(event.params.docId)
    },
    UPDATED: async (event) => {
      // Realtime Database のインデックスを更新
      const isChangedAsIndex = extractDiffsFromDocUpdatedEvent({
        event,
        ComparisonClass: SiteIndex,
      })
      if (isChangedAsIndex.length > 0) {
        await SiteIndex.create(event.params.docId)
      }

      /**
       * Access 版 AirGuard から更新された現場の座標情報更新処理
       * Access 版 AirGuard との同期処理で現場情報が更新された場合、現場の座標情報が更新されません。
       * 便宜的に更新処理を加えるために追加していますので、この処理は Access 版 AirGuard からのインポートが
       * 不必要になった時点で削除してください。
       */
      const { address, location } = event.data.after.data()
      const { address: beforeAddress } = event.data.before.data()
      // 住所が変更されている、または座標情報がセットされていない場合は座標情報を取得
      if (beforeAddress !== address || !location?.lat || !location?.lng) {
        logger.warn(
          `***** CAUTION ***** 座標情報の暫定更新処理を行います。この処理は Access 版 AirGuard からのインポートフローが無くなった時点で削除してください。`
        )
        const coordinates = await fetchCoordinates(address)
        if (coordinates) {
          // 座標情報が取得が取得できたら再度現場ドキュメントの更新処理を行う
          // もう一度トリガーが起動するが、住所が変更されている条件を満たさないため、ループはしない。
          await event.data.after.ref.update({ location: coordinates })
        }
      }
    },
    DELETED: async (event) => {
      // Realtime Databaseインデックスを削除
      await SiteIndex.remove(event.params.docId)

      // 従属する現場取極め, 現場稼働予定を削除
      await removeDependentDocuments(
        ['SiteContracts', 'SiteOperationSchedules'],
        'siteId',
        event.params.docId
      )
    },
  },
}

/*****************************************************************************
 * コレクション間の同期定義
 *****************************************************************************/
const DOCUMENT_SYNC_DEFINITIONS = {
  // 取引先
  Customers: {
    // 取引先 -> 現場
    Sites: {
      referenceClass: Site,
      updateProp: 'customer',
      compareProp: 'customerId',
    },
  },

  // 現場
  Sites: {
    // 現場 -> 現場取極め
    SiteContracts: {
      referenceClass: SiteContract,
      updateProp: 'site',
      compareProp: 'siteId',
    },

    // 現場 -> 現場稼働予定
    SiteOperationSchedules: {
      referenceClass: SiteOperationSchedule,
      updateProp: 'site',
      compareProp: 'siteId',
    },

    // 現場 -> 稼働実績
    OperationResults: {
      referenceClass: OperationResult,
      updateProp: 'site',
      compareProp: 'siteId',
    },
  },

  // 従業員
  Employees: {
    // 従業員 -> 雇用契約
    EmployeeContracts: {
      referenceClass: EmployeeContract,
      updateProp: 'employee',
      compareProp: 'employeeId',
    },

    // 従業員 -> 健康保険
    HealthInsurances: {
      referenceClass: class {
        static customClassMap = {
          employee: EmployeeMinimal,
        }
      },
      updateProp: 'employee',
      compareProp: 'employeeId',
    },

    // 従業員 -> 厚生年金
    Pensions: {
      referenceClass: class {
        static customClassMap = {
          employee: EmployeeMinimal,
        }
      },
      updateProp: 'employee',
      compareProp: 'employeeId',
    },

    // 従業員 -> 雇用保険
    EmploymentInsurances: {
      referenceClass: class {
        static customClassMap = {
          employee: EmployeeMinimal,
        }
      },
      updateProp: 'employee',
      compareProp: 'employeeId',
    },

    // 従業員 -> 健康診断
    MedicalCheckups: {
      referenceClass: class {
        static customClassMap = {
          employee: EmployeeMinimal,
        }
      },
      updateProp: 'employee',
      compareProp: 'employeeId',
    },
  },

  // 現場取極め
  SiteContracts: {
    // 現場取極め -> 稼働実績
    OperationResults: {
      referenceClass: OperationResult,
      updateProp: 'siteContract',
      compareProp: 'siteContractId',
    },
  },

  // 就業規則
  WorkRegulations: {
    // 就業規則 -> 雇用契約
    EmployeeContracts: {
      referenceClass: EmployeeContract,
      updateProp: 'workRegulation',
      compareProp: 'workRegulationId',
    },
  },
}

/*****************************************************************************
 * Firestore トリガーを登録するための汎用関数です。
 * イベントの状態からドキュメントの作成・更新・削除を判断し、適切なハンドラーを呼び出します。
 * @param {string} collectionPath - Firestore のコレクションパス（例: 'Customers/{docId}'）
 *****************************************************************************/
function registerFirestoreTrigger(collectionPath) {
  return onDocumentWritten(collectionPath, async (event) => {
    const beforeData = event.data.before?.exists
      ? event.data.before.data()
      : null
    const afterData = event.data.after?.exists ? event.data.after.data() : null

    let eventType
    if (!beforeData && afterData) {
      eventType = 'CREATED' // ドキュメント作成
    } else if (beforeData && afterData) {
      eventType = 'UPDATED' // ドキュメント更新
    } else if (beforeData && !afterData) {
      eventType = 'DELETED' // ドキュメント削除
    } else {
      return // 何も変化がない場合（通常ありえない）
    }

    await handleFirestoreEvent(eventType, event)
  })
}

/*****************************************************************************
 * Firestore トリガーイベントオブジェクトを受け取り、COLLECTION_HANDLERS に定義された
 * 処理を実行します。
 * @param {string} eventType - イベント種別（例: CREATED, UPDATED, DELETED）
 * @param {*} event - Firestore トリガーイベントオブジェクト
 *****************************************************************************/
async function handleFirestoreEvent(eventType, event) {
  try {
    // コレクション名を取得
    const collectionName = getCollectionName(event.document)

    // 対応するハンドラーを取得
    const handler = COLLECTION_HANDLERS[collectionName]?.[eventType]

    // ハンドラーの定義があれば実行
    if (handler) {
      logger.info(`[onWrite${collectionName}] handler definitions found.`)
      await handler(event)
    } else {
      logger.warn(
        `[onWrite${collectionName}] No handler defined for ${collectionName} ${eventType}`
      )
    }

    // UPDATE の場合は handleSyncronizeDependentDocuments を実行
    if (eventType === 'UPDATED') {
      await handleSyncronizeDependentDocuments(event)
    }

    logger.info(
      `[onWrite${collectionName}] Syncronize handler executed successfully for ${collectionName} ${eventType}`
    )
  } catch (error) {
    // エラー処理
    logger.error(`Error handling Firestore event:`, error)
  }
}

/*****************************************************************************
 * 引数に Firestore の更新トリガーイベントオブジェクトを受け取り、
 * DOCUMENT_SYNC_DEFINITIONS で定義された条件で、従属するドキュメントの
 * 非正規化されたデータを同期します。
 * @param {Object} event - Firestore 更新トリガーイベントオブジェクト
 * @returns Promise{void} 処理が完了すると解決される Promise
 *****************************************************************************/
async function handleSyncronizeDependentDocuments(event) {
  // 更新情報（タイムスタンプなど）以外に変更がなければ終了
  if (!isDocumentChanged(event)) return

  // 更新されたドキュメントのコレクション名とドキュメントIDを取得
  const updatedCollectionId = getCollectionName(event.document)
  const docId = event.params.docId

  // 更新されたコレクションの同期定義を取得
  const definitions = DOCUMENT_SYNC_DEFINITIONS[updatedCollectionId]

  // 定義が存在しない場合は終了
  if (!definitions) return

  // 定義の内容をフォーマットしてログに出力
  const formattedDefinitions = Object.keys(definitions)
    .map((targetCollection) => {
      return `${updatedCollectionId} -> ${targetCollection}`
    })
    .join(', ')

  logger.info(
    `[onWrite${updatedCollectionId}] Synchronization definitions found: ${formattedDefinitions}`
  )

  /*****************************************************
   * 参照クラス設定による処理に切り替える際にコメント解除
   *****************************************************/
  // 定義内容を確認
  for (const [collectionId, defs] of Object.entries(definitions)) {
    const { referenceClass, updateProp, compareProp } = defs
    if (!referenceClass || !updateProp || !compareProp) {
      logger.error(
        `[onWrite${updatedCollectionId}] Synchronization definition of ${collectionId} does not have required property.`
      )
      return
    }
    const ComparisonClass = referenceClass.customClassMap?.[updateProp]
    if (!ComparisonClass) {
      logger.error(
        `[onWrite${updatedCollectionId}] '${updateProp}' property does not defined as customClassMap at reference class.`
      )
      return
    }
  }

  try {
    // 同期処理を直列で実行
    for (const [collectionId, defs] of Object.entries(definitions)) {
      /*************************************************
       * 参照クラス設定による処理に切り替えたらコード差し替え
       *************************************************/
      const { referenceClass, updateProp, compareProp } = defs
      const ComparisonClass = referenceClass.customClassMap?.[updateProp]
      logger.info(
        `[onWrite${updatedCollectionId}] ${updatedCollectionId} >>>>> ${collectionId}`
      )

      // 差分を取得
      const differences = extractDiffsFromDocUpdatedEvent({
        event,
        ComparisonClass,
      })

      if (differences.length === 0) {
        const message = `[onWrite${updatedCollectionId}] No differences found for collection: ${collectionId}`
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

      const message = `[onWrite${updatedCollectionId}] Synced documents in collection: ${collectionId}`
      logger.log(message)
    }
  } catch (error) {
    logger.error(
      `[onWrite${updatedCollectionId}] Error syncing dependent documents:`,
      error
    )
  }
}

/*****************************************************************************
 * ドキュメントパスからコレクション名を抽出して返します。
 * @param {string} documentPath - Firestore ドキュメントのパス
 * @returns {string} コレクション名
 *****************************************************************************/
function getCollectionName(documentPath) {
  return documentPath.split('/')[0]
}

/*****************************************************************************
 * トリガー登録 & エクスポート
 *****************************************************************************/
// Customers
export const onWriteCustomers = registerFirestoreTrigger('Customers/{docId}')

// Sites
export const onWriteSites = registerFirestoreTrigger('Sites/{docId}')

// Employees
export const onWriteEmployees = registerFirestoreTrigger('Employees/{docId}')

// SiteContracts
export const onWriteSiteContracts = registerFirestoreTrigger(
  'SiteContracts/{docId}'
)

// WorkRegulations
export const onWriteWorkRegulations = registerFirestoreTrigger(
  'WorkRegulations/{docId}'
)
