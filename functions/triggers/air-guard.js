/****************************************************************************
 * Realtime Databaseに登録されているAirGuardのマスタデータについて更新トリガーを用意し、
 * 対応するFirestoreドキュメントを同期するモジュールを呼び出します。
 *
 * 処理対象：
 * - `AirGuard/Customers/{code}`
 * - `AirGuard/Sites/{code}`
 * - `AirGuard/Employees/{code}`
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-09 - 初版作成
 ****************************************************************************/

import { info, error } from 'firebase-functions/logger'
import { onValueUpdated } from 'firebase-functions/v2/database'
import {
  syncAirGuardCustomerToFirestore,
  syncAirGuardSiteToFirestore,
  syncAirGuardEmployeeToFirestore,
} from '../modules/air-guard.js'

/****************************************************************************
 * `AirGuard/Customers/{code}`が更新された時の処理です。
 * 対象データが有効なdocIdを保有していた場合、対象のFirestoreドキュメントと同期します。
 * @param {Object} event Firebase Realtime Databaseの更新イベント
 * @returns {Promise<void>} 同期処理の結果を返します
 ****************************************************************************/
export const customerUpdated = onValueUpdated(
  { ref: `/AirGuard/Customers/{code}`, region: 'us-central1' },
  async (event) => {
    try {
      const data = event.data.after.val()
      // Customerデータの更新を検知した旨のログを記録
      info(`[customerUpdated] Customerデータの更新を検知しました。`, {
        code: data.code,
        name1: data.name1,
        name2: data.name2,
      })
      // docIdが設定されていない場合の処理を終了
      if (!data.docId) {
        info(`[customerUpdated] docIdが未設定であるため処理を終了します。`)
        return
      }
      // Firestoreとデータの同期
      info(`[customerUpdated] Customersドキュメントとの同期処理を開始します。`)
      await syncAirGuardCustomerToFirestore(data)
      info(
        `[customerUpdated] Customersドキュメントとの同期処理が終了しました。`
      )
    } catch (err) {
      // エラーハンドリング
      error(
        `[customerUpdated] 同期処理中にエラーが発生しました: ${err.message}`,
        { err }
      )
    }
  }
)

/****************************************************************************
 * `AirGuard/Sites/{code}`が更新された時の処理です。
 * 対象データが有効なdocIdを保有していた場合、対象のFirestoreドキュメントと同期します。
 * @param {Object} event Firebase Realtime Databaseの更新イベント
 * @returns {Promise<void>} 同期処理の結果を返します
 ****************************************************************************/
export const siteUpdated = onValueUpdated(
  { ref: `/AirGuard/Sites/{code}`, region: 'us-central1' },
  async (event) => {
    try {
      const data = event.data.after.val()
      // Siteデータの更新を検知した旨のログを記録
      info(`[siteUpdated] Siteデータの更新を検知しました。`, {
        code: data.code,
        name: data.name,
      })
      // docIdが設定されていない場合の処理を終了
      if (!data.docId) {
        info(`[siteUpdated] docIdが未設定であるため処理を終了します。`)
        return
      }
      // Firestoreとデータの同期
      info(`[siteUpdated] Sitesドキュメントとの同期処理を開始します。`)
      await syncAirGuardSiteToFirestore(data)
      info(`[siteUpdated] Sitesドキュメントとの同期処理が終了しました。`)
    } catch (err) {
      // エラーハンドリング
      error(`[siteUpdated] 同期処理中にエラーが発生しました: ${err.message}`, {
        err,
      })
    }
  }
)
/****************************************************************************
 * `AirGuard/Employees/{code}`が更新された時の処理です。
 * 対象データが有効なdocIdを保有していた場合、対象のFirestoreドキュメントと同期します。
 * @param {Object} event Firebase Realtime Databaseの更新イベント
 * @returns {Promise<void>} 同期処理の結果を返します
 ****************************************************************************/
export const employeeUpdated = onValueUpdated(
  { ref: `/AirGuard/Employees/{code}`, region: 'us-central1' },
  async (event) => {
    try {
      const data = event.data.after.val()
      // Employeeデータの更新を検知した旨のログを記録
      info(`[employeeUpdated] Employeeデータの更新を検知しました。`, {
        code: data.code,
        name: `${data.lastName} ${data.firstName}`,
      })
      // docIdが設定されていない場合の処理を終了
      if (!data.docId) {
        info(`[employeeUpdated] docIdが未設定であるため処理を終了します。`)
        return
      }
      // Firestoreとデータの同期
      info(`[employeeUpdated] Employeesドキュメントとの同期処理を開始します。`)
      await syncAirGuardEmployeeToFirestore(data)
      info(
        `[employeeUpdated] Employeesドキュメントとの同期処理が終了しました。`
      )
    } catch (err) {
      // エラーハンドリング
      error(
        `[employeeUpdated] 同期処理中にエラーが発生しました: ${err.message}`,
        {
          err,
        }
      )
    }
  }
)
