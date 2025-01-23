import { onValueCreated, onValueUpdated } from 'firebase-functions/v2/database'
import { logger } from 'firebase-functions/v2'
import Customer from '../models/Customer.js'
import Site from '../models/Site.js'
import Employee from '../models/Employee.js'
import Outsourcer from '../models/Outsourcer.js'

/**
 * Realtime Database の AirGuard ノードにデータが追加された時の処理です。
 * docId: false をデータに追加します。
 *
 * クライアントから AirGuard のマスタデータが登録される際、もととなる csv データには
 * docId がありません。よって、docId プロパティのないデータが登録されます。
 * クライアントでは Firestore に保存されている各種マスタと同期されていない AirGuard の
 * データを抽出する際、この docId が null であるものを限定していますが、なぜか
 * null でないものも抽出されてしまいます。
 * Realttime Database の null 評価が疑わしく、敢えて false を設定することでこれを
 * 回避しようというものです。
 *
 * 結果、AirGuard ノードの onValueUpdated がコールされてしまいますが、
 * if(!docId) 評価をしているため、後続の処理に影響はありません。
 *
 * @author shisyamo4131
 * @refact 2025-01-23
 */
export const onCreated = onValueCreated(
  { ref: `/AirGuard/{collectionId}/{code}`, region: 'us-central1' },
  async (event) => {
    await event.data.ref.update({ docId: false })
  }
)

/****************************************************************************
 * Realtime Database に登録されている AirGuard のマスタデータの更新トリガーです。
 * 更新されたデータのコレクションを判別し、対応するFirestoreドキュメントを同期する
 * モジュールを呼び出します。
 *
 * 処理対象：
 * - `AirGuard/Customers/{code}`
 * - `AirGuard/Sites/{code}`
 * - `AirGuard/Employees/{code}`
 * - `AirGuard/Outsourcers/{code}`
 *
 * @author shisyamo4131
 * @refact 2025-01-23
 ****************************************************************************/
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
