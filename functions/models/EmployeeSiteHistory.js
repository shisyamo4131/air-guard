import { getDatabase } from 'firebase-admin/database'
import * as logger from 'firebase-functions/logger'
import dayjs from 'dayjs'
import OperationWorkResult from './OperationWorkResult.js'
const database = getDatabase()

/**
 * EmployeeSiteHistory クラス
 *
 * - 従業員の現場入場履歴を管理し、更新するためのクラス
 *
 * /EmployeeSiteHistory
 *   |- ${employeeId}                    // 従業員ごとのルートノード
 *     |- ${siteId}                      // employeeId の子として siteId 別に保持
 *       |- firstDate: 'YYYY-MM-DD'      // 最初の稼働日
 *       |- firstOperationId: ${docId}   // 対象となる稼働実績ドキュメントID
 *       |- lastDate: 'YYYY-MM-DD'       // 最終稼働日
 *       |- lastOperationId: ${docId}    // 対象となる稼働実績ドキュメントID
 *
 * NOTE:
 * 従業員現場入場履歴は従業員稼働実績ドキュメントを基に更新されるデータですが、当該ドキュメントの作成・更新トリガーでの
 * 更新は行いません。
 * - トリガーに依存した処理になるため出来るだけ避けたい。
 * - 日時バッチ処理にて更新されるほか、アプリ側のメンテナンス機能として更新する処理を用意しています。
 * - 従業員稼働実績ドキュメントの削除に対する処理のみ、削除トリガーを使用しています。
 */
export class EmployeeSiteHistory {
  /**
   * 指定された employeeId、siteId、date, operationResultId に基づいて最深部の firstDate や lastDate を更新します。
   * @param {Object} params
   * @param {string} params.employeeId - 従業員の ID
   * @param {string} params.date - 稼働日 (YYYY-MM-DD 形式)
   * @param {string} params.siteId - 現場の ID
   * @param {string} params.operationResultId - 稼働実績ドキュメントID
   * @returns {Promise<void>} - 更新処理の結果を返す
   */
  static async update({ employeeId, date, siteId, operationResultId }) {
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
        : {
            firstDate: date,
            firstOperationId: operationResultId,
            lastDate: date,
            lastOperationId: operationResultId,
          }
      if (!siteSnap.exists()) updates[sitePath] = siteData

      if (date < siteData.firstDate) {
        updates[`${sitePath}/firstDate`] = date
        updates[`${sitePath}/firstOperationId`] = operationResultId
      }

      if (date > siteData.lastDate) {
        updates[`${sitePath}/lastDate`] = date
        updates[`${sitePath}/lastOperationId`] = operationResultId
      }

      // Firebase Realtime Database に更新を適用
      if (Object.keys(updates).length) {
        await database.ref().update(updates)
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
   * 指定された従業員の現場入場履歴を強制的に更新します。
   * - 従業員稼働実績ドキュメントを使用します。
   * - 従業員稼働実績ドキュメントが削除された時に現場入場履歴を更新するために使用するほか、
   *   バグなどの理由で現場入場履歴が正常に記録されていなかった場合の強制的な処理です。
   * - 大量のデータ、ドキュメントを読み込む可能性があるため、必要な時にだけ実行してください。
   * - 現場IDが指定された場合、対象の現場のみで強制更新します。
   * @param {string} employeeId 従業員ID
   * @param {string} siteId 現場ID（オプション）
   */
  static async updateByEmployeeId({ employeeId, siteId }) {
    try {
      // 処理開始ログを出力
      logger.info(`[updateByEmployeeId] 従業員の現場入場履歴を更新します。`, {
        employeeId,
        siteId,
      })

      // 対象従業員（現場が指定されていれば現場）の入場履歴を一旦削除
      const path = siteId
        ? `EmployeeSiteHistory/${employeeId}/${siteId}`
        : `EmployeeSiteHistory/${employeeId}`
      await database.ref(path).remove()

      // 対象従業員が稼働した従業員稼働実績ドキュメントをすべて取得
      const workResultInstance = new OperationWorkResult()
      const conditions = [['where', 'employeeId', '==', employeeId]]
      if (siteId) conditions.push(['where', 'siteId', '==', siteId])

      const workResultDocs = await workResultInstance.fetchDocs(conditions)

      // 従業員稼働実績ドキュメントが存在しなければ終了
      if (!workResultDocs.length) {
        logger.info(
          `従業員稼働実績が存在しませんでした。現場入場履歴の更新処理を終了します。`,
          { employeeId, siteId }
        )
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

      await database.ref(path).set(data)

      // 終了ログを出力
      logger.info(`従業員の現場入場履歴を更新しました。`, {
        employeeId,
        siteId,
      })
    } catch (error) {
      const message = `[updateByEmployeeId] 従業員の現場入場履歴更新処理でエラーが発生しました。`
      logger.error(message, { employeeId, siteId, error })
      throw error
    }
  }

  /**
   * 引数で与えられた日時以降に作成または更新された従業員稼働実績ドキュメントを
   * もとに、従業員の現場入場履歴を更新します。
   * @param {Date} timestamp 基準とする日時（Dateオブジェクト）
   * @returns
   */
  static async updateByTimestamp(timestamp) {
    // 引数のチェック
    if (!timestamp || !(timestamp instanceof Date)) {
      logger.error(`[updateByTimestamp] timestampがDate型ではありません。`, {
        timestamp,
      })
      throw new Error(
        `[updateByTimestamp] timestampは有効なDate型インスタンスである必要があります。`
      )
    }

    // 締め切り日時をフォーマットしておく
    const deadline = dayjs(timestamp).utcOffset(9).format('YYYY-MM-DD HH:mm:ss')

    try {
      // 処理開始ログを出力
      logger.info(
        `[updateByTimestamp] ${deadline} 以降に作成または更新された従業員稼働実績ドキュメントを対象に従業員の現場入場履歴を更新します。`
      )

      // 指定された timestamp 以降に作成または更新された従業員稼働実績ドキュメントを取得
      const resultInstance = new OperationWorkResult()
      const createdDocs = await resultInstance.fetchDocs([
        ['where', 'createAt', '>=', timestamp],
      ])
      const updatedDocs = await resultInstance.fetchDocs([
        ['where', 'updateAt', '>=', timestamp],
      ])

      // 対象の従業員稼働実績ドキュメントが存在しなければ終了
      if (!createdDocs.length && !updatedDocs.length) {
        logger.info(
          `[updateByTimestamp] ${deadline} 以降に作成または更新された従業員稼働実績ドキュメントは存在しませんでした。処理を終了します。`
        )
        return
      }

      // 対象の従業員稼働実績ドキュメントから重複を排除
      const targetDocs = createdDocs.concat(updatedDocs).reduce((acc, doc) => {
        if (!acc.some(({ docId }) => docId === doc.docId)) acc.push(doc)
        return acc
      }, [])

      // 対象の従業員稼働実績ドキュメントが存在したことをログに出力
      logger.info(`${targetDocs.length} 件の対象ドキュメントが見つかりました。`)

      // 対象の従業員稼働実績ドキュメントから、現場入場履歴の元データを作成
      const data = targetDocs.reduce((result, doc) => {
        const { employeeId, siteId, date, operationResultId } = doc

        if (!result[employeeId]) result[employeeId] = {}

        if (!result[employeeId][siteId]) {
          result[employeeId][siteId] = {
            firstDate: date,
            firstOperationId: operationResultId,
            lastDate: date,
            lastOperationId: operationResultId,
          }
        } else {
          const siteEntry = result[employeeId][siteId]
          if (date < siteEntry.firstDate) {
            siteEntry.firstDate = date
            siteEntry.firstOperationId = operationResultId
          }
          if (date > siteEntry.lastDate) {
            siteEntry.lastDate = date
            siteEntry.lastOperationId = operationResultId
          }
        }

        return result
      }, {})

      // firstDate について処理
      const promises = []
      for (const [employeeId, sites] of Object.entries(data)) {
        for (const [siteId, obj] of Object.entries(sites)) {
          const { firstDate, firstOperationId } = obj
          promises.push(
            EmployeeSiteHistory.update({
              employeeId,
              siteId,
              date: firstDate,
              operationResultId: firstOperationId,
            })
          )
        }
      }
      await Promise.all(promises)

      // lastDate について処理
      promises.splice(0)
      for (const [employeeId, sites] of Object.entries(data)) {
        for (const [siteId, obj] of Object.entries(sites)) {
          const { lastDate, lastOperationId } = obj
          promises.push(
            EmployeeSiteHistory.update({
              employeeId,
              siteId,
              date: lastDate,
              operationResultId: lastOperationId,
            })
          )
        }
      }
      await Promise.all(promises)

      // 処理完了ログを出力
      logger.info(
        `[updateByTimestamp] 従業員の現場入場履歴の更新処理が完了しました。`
      )
    } catch (error) {
      const message = `[updateByTimestamp] 従業員の現場入場履歴更新処理でエラーが発生しました。`
      logger.error(message, { timestamp: deadline, error })
      throw error
    }
  }
}
