import { getDatabase } from 'firebase-admin/database'
import { getFirestore } from 'firebase-admin/firestore'
import { onCall } from 'firebase-functions/v2/https'
import { https, logger } from 'firebase-functions/v2'
import EmployeeIndex from '../models/EmployeeIndex.js'
import SiteIndex from '../models/SiteIndex.js'
import CustomerIndex from '../models/CustomerIndex.js'
import DailyAttendance from '../models/DailyAttendance.js'
import MonthlyAttendance from '../models/MonthlyAttendance.js'

const database = getDatabase()
const firestore = getFirestore()

/****************************************************************************
 * Realtime Database のインデックスを更新する汎用関数です。
 * - リクエストで指定されたコレクション（`Employees`、`Sites`、`Customers`）に基づいて
 *   Firestore のデータを取得し、インデックスを再生成します。
 *
 * @param {Object} request - Cloud Functions の `onCall` から渡されるリクエストオブジェクト。
 * @param {string} request.indexType - インデックスの対象（`Employees`, `Sites`, `Customers`, `all`）
 * @returns {Promise<void>} - インデックス更新が完了した場合に解決される Promise。
 * @throws {https.HttpsError} アプリ側とサーバーログの両方にエラーメッセージを出力。
 ****************************************************************************/
export const refreshIndex = onCall(async (request) => {
  const { indexType } = request.data

  // 有効なインデックスタイプをリストアップ
  const validTypes = ['Employees', 'Sites', 'Customers', 'all']

  // 無効なインデックスタイプが指定された場合のエラーハンドリング
  if (!validTypes.includes(indexType)) {
    const errorMessage = '無効なインデックスタイプが指定されました。'
    logger.error(
      `[refreshIndex] ${errorMessage} 指定された indexType: ${indexType}`
    )
    throw new https.HttpsError('invalid-argument', errorMessage)
  }

  // "all" が指定された場合、すべてのインデックスを更新
  const indexTypesToUpdate =
    indexType === 'all' ? ['Employees', 'Sites', 'Customers'] : [indexType]

  try {
    // 各インデックスタイプごとに処理を実行
    for (const type of indexTypesToUpdate) {
      const indexRef = database.ref(type)
      const colRef = firestore.collection(type)
      const snapshot = await colRef.get()

      // インデックスデータを構築
      const indexData = snapshot.docs.reduce((acc, doc) => {
        const docId = doc.id
        let data

        // インデックスの種類によってデータを変換
        if (type === 'Employees') {
          data = new EmployeeIndex(doc.data())
        } else if (type === 'Sites') {
          data = new SiteIndex(doc.data())
        } else if (type === 'Customers') {
          data = new CustomerIndex(doc.data())
        }

        acc[docId] = data.toObject() // インデックスオブジェクトをシリアライズ
        return acc
      }, {})

      // 新しいインデックスをRealtime Databaseに設定
      await indexRef.set(indexData)

      logger.info(
        `[refreshIndex] ${type}インデックスの更新が正常に完了しました。`
      )
    }

    // 正常終了時にアプリに結果を返す
    return {
      message: `${
        indexType === 'all' ? 'すべての' : indexType
      }インデックスの更新が正常に完了しました。`,
    }
  } catch (error) {
    // サーバー側のエラーログ
    logger.error(
      `[refreshIndex] インデックス更新処理でエラーが発生しました。`,
      { request }
    )
    throw new https.HttpsError(
      'unknown',
      'インデックス更新処理でエラーが発生しました。'
    )
  }
})

export const refreshDailyAttendances = onCall(async (request) => {
  const { from, to } = request.data

  try {
    await DailyAttendance.createInRange({ from, to })
    await DailyAttendance.updateWeeklyAttendance({ from, to })
    await MonthlyAttendance.createInRange({ month: '2017-04' })
    // 正常終了時にアプリに結果を返す
    return {
      message: `[refreshDailyAttendances] DailyAttendances ドキュメントの作成が完了しました。`,
    }
  } catch (error) {
    // サーバー側のエラーログ
    logger.error(
      `[refreshDailyAttendances] DailyAttendances ドキュメントの作成処理でエラーが発生しました。`,
      { request }
    )
    throw new https.HttpsError(
      'unknown',
      'DailyAttendances ドキュメントの作成処理でエラーが発生しました。'
    )
  }
})
