import { getDatabase } from 'firebase-admin/database'
import * as logger from 'firebase-functions/logger'
import OperationWorkResult from './OperationWorkResult.js'
const database = getDatabase()

/**
 * EmployeeSiteHistory クラス
 *
 * - 従業員の稼働履歴を管理し、更新するためのクラス
 *
 * /EmployeeSiteHistory
 *   |- ${employeeId}                    // 従業員ごとのルートノード
 *     |- ${siteId}                      // employeeId の子として siteId 別に保持
 *       |- firstDate: 'YYYY-MM-DD'      // 最初の稼働日
 *       |- firstOperationId: ${docId}   // 対象となる稼働実績ドキュメントID
 *       |- lastDate: 'YYYY-MM-DD'       // 最終稼働日
 *       |- lastOperationId: ${docId}    // 対象となる稼働実績ドキュメントID
 *
 */
export class EmployeeSiteHistory {
  /**
   * 指定された employeeId、siteId、date に基づいて最深部の firstDate や lastDate を更新します。
   * @param {string} employeeId - 従業員の ID
   * @param {string} date - 稼働日 (YYYY-MM-DD 形式)
   * @param {string} siteId - 現場の ID
   * @returns {Promise<void>} - 更新処理の結果を返す
   */
  static async update(employeeId, date, siteId) {
    try {
      // 更新用オブジェクト
      const updates = {}

      // employeeId 配下の siteId ノードの更新
      const sitePath = `/EmployeeSiteHistory/${employeeId}/${siteId}`
      const siteRef = database.ref(sitePath)
      const siteSnap = await siteRef.get()

      // siteId 単位のデータが存在しなければ date を初回稼働日、最終稼働日として扱う
      const siteData = siteSnap.exists()
        ? siteSnap.val()
        : { firstDate: date, lastDate: date }
      if (!siteSnap.exists()) updates[sitePath] = siteData

      if (date < siteData.firstDate) {
        updates[`${sitePath}/firstDate`] = date
      }

      if (date > siteData.lastDate) {
        updates[`${sitePath}/lastDate`] = date
      }

      // Firebase Realtime Database に更新を適用
      if (Object.keys(updates).length) {
        await database.ref().update(updates)

        // 更新があった場合にのみ、完了ログを出力
        logger.info(
          `EmployeeSiteHistory の更新が完了しました: employeeId=${employeeId}, date=${date}, siteId=${siteId}`
        )
      }
    } catch (error) {
      logger.error(
        `EmployeeSiteHistory の更新中にエラーが発生しました: employeeId=${employeeId}, date=${date}, siteId=${siteId}`,
        error
      )
      throw new Error(`Failed to update EmployeeSiteHistory: ${error.message}`)
    }
  }

  /**
   * 指定された従業員の稼働履歴を強制的に更新します。
   * - バグなどの理由で稼働履歴が正常に記録されていなかった場合の強制的な処理です。
   * - 大量のデータ、ドキュメントを読み込む可能性があるため、必要な時にだけ実行してください。
   * - 現場IDが指定された場合、対象の現場のみで強制更新します。
   * - 稼働実績ドキュメントが削除された際の稼働履歴の更新には便利です。
   *
   * @param {string} employeeId 従業員ID
   * @param {string} siteId 現場ID（オプション）
   */
  static async updateForce(employeeId, siteId) {
    try {
      // 処理開始ログを出力
      logger.info(
        `updateForce が呼び出されました。従業員の稼働履歴を強制更新します。`,
        { employeeId, siteId }
      )

      // 対象従業員が稼働した従業員稼働実績ドキュメントをすべて取得
      const workResultInstance = new OperationWorkResult()
      const conditions = [['where', 'employeeId', '==', employeeId]]
      if (siteId) conditions.push(['where', 'siteId', '==', siteId])

      const workResultDocs = await workResultInstance.fetchDocs(conditions)

      // 従業員稼働実績ドキュメントが存在しなければ稼働履歴を削除
      if (!workResultDocs.length) {
        logger.info(
          `稼働実績が存在しませんでした。稼働履歴を初期化して終了します。`,
          { employeeId, siteId }
        )
        const path = siteId
          ? `EmployeeSiteHistory/${employeeId}/${siteId}`
          : `EmployeeSiteHistory/${employeeId}`
        await database.ref(path).remove()
        return
      }

      // 稼働履歴データを作成
      const data = workResultDocs.reduce((sum, doc) => {
        const siteData = sum[doc.siteId] || {
          firstDate: doc.date,
          firstOperationId: doc.operationResultId,
          lastDate: doc.date,
          lastOperationId: doc.operationResultId,
        }

        if (doc.date < siteData.firstDate) {
          siteData.firstDate = doc.date
          siteData.firstOperationId = doc.operationResultId
        }
        if (doc.date > siteData.lastDate) {
          siteData.lastDate = doc.date
          siteData.lastOperationId = doc.operationResultId
        }

        sum[doc.siteId] = siteData
        return sum
      }, {})

      // 稼働履歴を更新
      const path = siteId
        ? `EmployeeSiteHistory/${employeeId}/${siteId}`
        : `EmployeeSiteHistory/${employeeId}`
      await database.ref(path).set(siteId ? data[siteId] : data)

      // 終了ログを出力
      logger.info(`従業員の稼働履歴を強制更新しました。`, {
        employeeId,
        siteId,
      })
    } catch (error) {
      logger.error(`稼働履歴の強制更新処理でエラーが発生しました。`, {
        employeeId,
        error,
      })
      throw error
    }
  }

  /**
   * 指定された従業員の現場履歴を強制的に更新します。
   * - 勤務実績ドキュメント（OperationWorkResults）を使用します。
   * - バグなどの理由で現場履歴が正常に記録されていなかった場合の強制的な処理です。
   * - 大量のデータ、ドキュメントを読み込む可能性があるため、必要な時にだけ実行してください。
   * - 現場IDが指定された場合、対象の現場のみで強制更新します。
   *
   * NOTE:
   * - 稼働実績ドキュメントが削除された際の現場履歴の更新には便利です。
   *
   * @param {string} employeeId 従業員ID
   * @param {string} siteId 現場ID（オプション）
   */
  static async updateByEmployeeId(employeeId, siteId) {
    try {
      // 処理開始ログを出力
      logger.info(`[updateByEmployeeId] 従業員の現場履歴を強制更新します。`, {
        employeeId,
        siteId,
      })

      // 対象従業員が稼働した従業員稼働実績ドキュメントをすべて取得
      const workResultInstance = new OperationWorkResult()
      const conditions = [['where', 'employeeId', '==', employeeId]]
      if (siteId) conditions.push(['where', 'siteId', '==', siteId])

      const workResultDocs = await workResultInstance.fetchDocs(conditions)

      // 従業員稼働実績ドキュメントが存在しなければ稼働履歴を削除
      if (!workResultDocs.length) {
        logger.info(
          `稼働実績が存在しませんでした。稼働履歴を初期化して終了します。`,
          { employeeId, siteId }
        )
        const path = siteId
          ? `EmployeeSiteHistory/${employeeId}/${siteId}`
          : `EmployeeSiteHistory/${employeeId}`
        await database.ref(path).remove()
        return
      }

      // 稼働履歴データを作成
      const data = workResultDocs.reduce((sum, doc) => {
        const siteData = sum[doc.siteId] || {
          firstDate: doc.date,
          firstOperationId: doc.operationResultId,
          lastDate: doc.date,
          lastOperationId: doc.operationResultId,
        }

        if (doc.date < siteData.firstDate) {
          siteData.firstDate = doc.date
          siteData.firstOperationId = doc.operationResultId
        }
        if (doc.date > siteData.lastDate) {
          siteData.lastDate = doc.date
          siteData.lastOperationId = doc.operationResultId
        }

        sum[doc.siteId] = siteData
        return sum
      }, {})

      // 稼働履歴を更新
      const path = siteId
        ? `EmployeeSiteHistory/${employeeId}/${siteId}`
        : `EmployeeSiteHistory/${employeeId}`
      await database.ref(path).set(siteId ? data[siteId] : data)

      // 終了ログを出力
      logger.info(`従業員の稼働履歴を強制更新しました。`, {
        employeeId,
        siteId,
      })
    } catch (error) {
      const message = `[updateByEmployeeId] 従業員の現場履歴強制更新処理でエラーが発生しました。`
      logger.error(message, { employeeId, siteId, error })
      throw error
    }
  }
}
