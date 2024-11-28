/****************************************************************************
 * Realtime Databaseに登録されているAirGuardのマスタデータについて更新トリガーを用意し、
 * 対応するFirestoreドキュメントを同期するモジュールを呼び出します。
 *
 * 処理対象：
 * - `AirGuard/Customers/{code}`
 * - `AirGuard/Sites/{code}`
 * - `AirGuard/Employees/{code}`
 * - `AirGuard/Outsourcers/{code}`
 *
 * @author shisyamo4131
 *
 * - 2024-11-28 - コレクション毎の処理をまとめました。
 ****************************************************************************/

import { onValueUpdated } from 'firebase-functions/v2/database'
import { logger } from 'firebase-functions/v2'
import Customer from '../models/Customer.js'
import Site from '../models/Site.js'
import Employee from '../models/Employee.js'
import Outsourcer from '../models/Outsourcer.js'

export const onUpdated = onValueUpdated(
  { ref: `/AirGuard/{collectionId}/{code}`, region: 'us-central1' },
  async (event) => {
    const functionName = 'onUpdated'
    const collectionId = event.params.collectionId
    const code = event.params.code
    const { docId } = event.data.after.val()

    try {
      logger.log(`[${functionName}] AirGuard データが更新されました。`, {
        collectionId,
        code,
      })

      // docId が設定されていない場合は処理をスキップ
      if (!docId) {
        logger.info(
          `[${functionName}] docId が設定されていないため同期処理をスキップします。`,
          {
            collectionId,
            code,
          }
        )
        return
      }

      // コレクションIDに基づいて同期処理を実行
      switch (collectionId) {
        case 'Customers':
          await Customer.syncFromAirGuard(code)
          break
        case 'Sites':
          await Site.syncFromAirGuard(code)
          break
        case 'Employees':
          await Employee.syncFromAirGuard(code)
          break
        case 'Outsourcers':
          await Outsourcer.syncFromAirGuard(code)
          break
        default:
          logger.warn(
            `[${functionName}] 未知のコレクションIDが指定されました: ${collectionId}`,
            {
              collectionId,
              code,
            }
          )
          return
      }

      logger.info(
        `[${functionName}] Firestore ドキュメントとの同期処理が正常に完了しました。`,
        { collectionId, code, docId }
      )
    } catch (error) {
      logger.error(`[${functionName}] 同期処理中にエラーが発生しました。`, {
        collectionId,
        code,
        docId,
        error: error.message, // エラーメッセージのみログに出力
      })
    }
  }
)

/****************************************************************************
 * `AirGuard/Customers/{code}`が更新された時の処理です。
 * 対象データが有効なdocIdを保有していた場合、対象のFirestoreドキュメントと同期します。
 ****************************************************************************/
// export const customerUpdated = onValueUpdated(
//   { ref: `/AirGuard/Customers/{code}`, region: 'us-central1' },
//   async (event) => {
//     try {
//       const { code, docId } = event.data.after.val()

//       // docId が存在しない場合は同期処理を行わない
//       if (!docId) {
//         logger.warn(
//           `[customerUpdated] docId が存在しないため、同期処理をスキップしました。`,
//           { code }
//         )
//         return
//       }

//       // 処理の開始ログを記録
//       logger.info(
//         `[customerUpdated] Firestore ドキュメントとの同期処理を開始します。`,
//         { code, docId }
//       )

//       // Customers データをFirestoreと同期
//       await Customer.syncFromAirGuard(code)

//       // 処理完了のログを記録
//       logger.info(
//         `[customerUpdated] Firestore ドキュメントとの同期処理が正常に完了しました。`,
//         { code, docId }
//       )
//     } catch (err) {
//       // エラーハンドリングと再スロー
//       logger.error(
//         `[customerUpdated] 同期処理中にエラーが発生しました: ${err.message}`,
//         { err }
//       )
//       throw err // エラーを再スローしてCloud Functionsに通知
//     }
//   }
// )

/****************************************************************************
 * `AirGuard/Sites/{code}`が更新された時の処理です。
 * 対象データが有効なdocIdを保有していた場合、対象のFirestoreドキュメントと同期します。
 ****************************************************************************/
// export const siteUpdated = onValueUpdated(
//   { ref: `/AirGuard/Sites/{code}`, region: 'us-central1' },
//   async (event) => {
//     try {
//       const { code, docId } = event.data.after.val()

//       // docId が存在しない場合は同期処理を行わない
//       if (!docId) {
//         logger.warn(
//           `[siteUpdated] docId が存在しないため、同期処理をスキップしました。`,
//           { code }
//         )
//         return
//       }

//       // 処理の開始ログを記録
//       logger.info(
//         `[siteUpdated] Firestore ドキュメントとの同期処理を開始します。`,
//         { code, docId }
//       )

//       // Sites データをFirestoreと同期
//       await Site.syncFromAirGuard(code)

//       // 処理完了のログを記録
//       logger.info(
//         `[siteUpdated] Firestore ドキュメントとの同期処理が正常に完了しました。`,
//         { code, docId }
//       )
//     } catch (err) {
//       // エラーハンドリングと再スロー
//       logger.error(
//         `[siteUpdated] 同期処理中にエラーが発生しました: ${err.message}`,
//         { err }
//       )
//       throw err // エラーを再スローしてCloud Functionsに通知
//     }
//   }
// )

/****************************************************************************
 * `AirGuard/Employees/{code}`が更新された時の処理です。
 * 対象データが有効なdocIdを保有していた場合、対象のFirestoreドキュメントと同期します。
 * @param {Object} event Firebase Realtime Databaseの更新イベント
 * @returns {Promise<void>} 同期処理の結果を返します
 ****************************************************************************/
// export const employeeUpdated = onValueUpdated(
//   { ref: `/AirGuard/Employees/{code}`, region: 'us-central1' },
//   async (event) => {
//     try {
//       const { code, docId } = event.data.after.val()

//       // docId が存在しない場合は同期処理を行わない
//       if (!docId) {
//         logger.warn(
//           `[employeeUpdated] docId が存在しないため、同期処理をスキップしました。`,
//           { code }
//         )
//         return
//       }

//       // 処理の開始ログを記録
//       logger.info(
//         `[employeeUpdated] Firestore ドキュメントとの同期処理を開始します。`,
//         { code, docId }
//       )

//       // Employees データをFirestoreと同期
//       await Employee.syncFromAirGuard(code)

//       // 処理完了のログを記録
//       logger.info(
//         `[employeeUpdated] Firestore ドキュメントとの同期処理が正常に完了しました。`,
//         { code, docId }
//       )
//     } catch (err) {
//       // エラーハンドリングと再スロー
//       logger.error(
//         `[employeeUpdated] 同期処理中にエラーが発生しました: ${err.message}`,
//         { err }
//       )
//       throw err // エラーを再スローしてCloud Functionsに通知
//     }
//   }
// )

/****************************************************************************
 * `AirGuard/Outsourcers/{code}`が更新された時の処理です。
 * 対象データが有効なdocIdを保有していた場合、対象のFirestoreドキュメントと同期します。
 ****************************************************************************/
// export const outsourcerUpdated = onValueUpdated(
//   { ref: `/AirGuard/Outsourcers/{code}`, region: 'us-central1' },
//   async (event) => {
//     try {
//       const { code, docId } = event.data.after.val()

//       // docId が存在しない場合は同期処理を行わない
//       if (!docId) {
//         logger.warn(
//           `[outsourcerUpdated] docId が存在しないため、同期処理をスキップしました。`,
//           { code }
//         )
//         return
//       }

//       // 処理の開始ログを記録
//       logger.info(
//         `[outsourcerUpdated] Firestore ドキュメントとの同期処理を開始します。`,
//         { code, docId }
//       )

//       // Outsourcers データをFirestoreと同期
//       await Outsourcer.syncFromAirGuard(code)

//       // 処理完了のログを記録
//       logger.info(
//         `[outsourcerUpdated] Firestore ドキュメントとの同期処理が正常に完了しました。`,
//         { code, docId }
//       )
//     } catch (err) {
//       // エラーハンドリングと再スロー
//       logger.error(
//         `[outsourcerUpdated] 同期処理中にエラーが発生しました: ${err.message}`,
//         { err }
//       )
//       throw err // エラーを再スローしてCloud Functionsに通知
//     }
//   }
// )
