import { getDatabase } from 'firebase-admin/database'
import { getFirestore } from 'firebase-admin/firestore'
import { onCall } from 'firebase-functions/v2/https'
import { https, logger } from 'firebase-functions/v2'
import EmployeeIndex from '../models/EmployeeIndex.js'
import SiteIndex from '../models/SiteIndex.js'
import CustomerIndex from '../models/CustomerIndex.js'
import System from '../models/System.js'

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

/****************************************************************************
 * 出勤簿を月次更新するための onCall 関数です。
 * - employeeId が指定されると、対象の従業員のみ処理します。
 * - date が指定されると、DailyAttendance については対象日を含む一週間（月～日）のみ処理します。
 *
 * @param {Object} request - Cloud Functions の `onCall` から渡されるリクエストオブジェクト。
 * @param {string} request.month - 更新対象の年月（YYYY-MM形式）
 * @param {string} request.employeeId - 更新対象の従業員ID（任意）
 * @param {string} request.date - 更新対象の日付（任意: YYYY-MM-DD 形式）
 * @returns {Promise<void>} - 更新処理が完了した場合に解決される Promise。
 * @throws {https.HttpsError} アプリ側とサーバーログの両方にエラーメッセージを出力。
 ****************************************************************************/
export const refreshMonthlyAttendances = onCall(async (request) => {
  const { month, employeeId, date } = request.data

  try {
    // 非同期処理の開始をログで通知
    logger.info(
      `[refreshMonthlyAttendances] 出勤簿の更新処理を開始しました。期間: ${month}${
        employeeId ? `、従業員ID: ${employeeId}` : ''
      }${date ? `、特定日: ${date}` : ''}`
    )

    // 非同期で calculateMonthlyAttendances を実行
    await System.calculateMonthlyAttendances({ month, employeeId, date })

    // 処理完了のメッセージを返す
    return {
      message: `[refreshMonthlyAttendances] 出勤簿の更新処理が正常に完了しました。期間: ${month}${
        employeeId ? `、従業員ID: ${employeeId}` : ''
      }${date ? `、特定日: ${date}` : ''}`,
    }
  } catch (error) {
    // サーバー側のエラーログ
    logger.error(
      `[refreshMonthlyAttendances] 出勤簿の更新処理で不明なエラーが発生しました。期間: ${month}${
        employeeId ? `、従業員ID: ${employeeId}` : ''
      }${date ? `、特定日: ${date}` : ''}`,
      { request }
    )
    throw new https.HttpsError(
      'unknown',
      `[refreshAttendances] 出勤簿の更新処理で不明なエラーが発生しました。`
    )
  }
})

/****************************************************************************
 * 月次売上を更新するための onCall 関数です。
 *
 * @param {Object} request - Cloud Functions の `onCall` から渡されるリクエストオブジェクト。
 * @param {string} request.month - 更新対象の年月（YYYY-MM形式）
 * @returns {Promise<void>} - 更新処理が完了した場合に解決される Promise。
 * @throws {https.HttpsError} アプリ側とサーバーログの両方にエラーメッセージを出力。
 ****************************************************************************/
export const refreshMonthlySales = onCall(async (request) => {
  const { month } = request.data

  try {
    // 非同期処理の開始をログで通知
    logger.info(
      `[refreshMonthlySales] 月次売上の更新処理を開始しました。期間: ${month}`
    )

    // 非同期で calculateMontlySales を実行
    await System.calculateMontlySales({ month })

    // 処理完了のメッセージを返す
    return {
      message: `[refreshMonthlySales] 月次売上の更新処理が正常に完了しました。期間: ${month}`,
    }
  } catch (error) {
    // サーバー側のエラーログ
    logger.error(
      `[refreshMonthlySales] 月次売上の更新処理で不明なエラーが発生しました。期間: ${month}`,
      { request }
    )
    throw new https.HttpsError(
      'unknown',
      `[refreshMonthlySales] 月次売上の更新処理で不明なエラーが発生しました。`
    )
  }
})

/****************************************************************************
 * 月別の現場請求額を更新するための onCall 関数です。
 *
 * @param {Object} request - Cloud Functions の `onCall` から渡されるリクエストオブジェクト。
 * @param {string} request.month - 更新対象の年月（YYYY-MM形式）
 * @returns {Promise<void>} - 更新処理が完了した場合に解決される Promise。
 * @throws {https.HttpsError} アプリ側とサーバーログの両方にエラーメッセージを出力。
 ****************************************************************************/
export const refreshSiteBillings = onCall(async (request) => {
  const { month } = request.data

  try {
    // 非同期処理の開始をログで通知
    logger.info(
      `[refreshSiteBillings] 月別の現場請求額更新処理を開始しました。期間: ${month}`
    )

    // 非同期で calculateSiteBillings を実行
    await System.calculateSiteBillings({ month })

    // 処理完了のメッセージを返す
    return {
      message: `[refreshSiteBillings] 月別の現場請求額更新処理が正常に完了しました。期間: ${month}`,
    }
  } catch (error) {
    // サーバー側のエラーログ
    logger.error(
      `[refreshSiteBillings] 月別の現場請求額更新処理で不明なエラーが発生しました。期間: ${month}`,
      { request }
    )
    throw new https.HttpsError(
      'unknown',
      `[refreshSiteBillings] 月別の現場請求額更新処理で不明なエラーが発生しました。`
    )
  }
})
