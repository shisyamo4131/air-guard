import { getDatabase } from 'firebase-admin/database'
import * as logger from 'firebase-functions/logger'
import dayjs from 'dayjs'
import OperationWorkResult from './OperationWorkResult.js'
const database = getDatabase()

/**
 * SiteEmployeeHistory クラス
 *
 * - 現場の従業員入場履歴を管理し、更新するためのクラス
 *
 * /SiteEmployeeHistory
 *   |- ${siteId}                        // 現場IDごとのノード
 *     |- ${employeeId}                  // 従業員IDごとのノード
 *       |- firstDate: 'YYYY-MM-DD'      // 最初の入場日
 *       |- firstOperationId: ${docId}   // 対象となる稼働実績ドキュメントID
 *       |- lastDate: 'YYYY-MM-DD'       // 最終入場日
 *       |- lastOperationId: ${docId}    // 対象となる稼働実績ドキュメントID
 *
 * NOTE:
 * 現場の従業員入場履歴は従業員稼働実績ドキュメントを基に更新されるデータですが、当該ドキュメントの作成・更新トリガーでの
 * 更新は行いません。
 * - トリガーに依存した処理になるため出来るだけ避けたい。
 * - 日時バッチ処理にて更新されるほか、アプリ側のメンテナンス機能として更新する処理を用意しています。
 * - 従業員稼働実績ドキュメントの削除に対する処理のみ、削除トリガーを使用しています。
 */
export class SiteEmployeeHistory {
  /**
   * 指定された siteId、employeeId、date, operationResultId に基づいて最深部の firstDate や lastDate を更新します。
   * @param {Object} params
   * @param {string} params.employeeId - 従業員の ID
   * @param {string} params.date - 稼働日 (YYYY-MM-DD 形式)
   * @param {string} params.siteId - 現場の ID
   * @param {string} params.operationResultId - 稼働実績ドキュメントID
   * @returns {Promise<void>} - 更新処理の結果を返す
   */
  static async update({ siteId, employeeId, date, operationResultId }) {
    try {
      // 更新用オブジェクト
      const updates = {}

      // siteId 配下の employee ノードの更新
      const employeePath = `/SiteEmployeeHistory/${siteId}/${employeeId}`
      const employeeRef = database.ref(employeePath)
      const employeeSnap = await employeeRef.get()

      // employeeId 単位のデータが存在しなければ date を初回稼働日、最終稼働日として扱う
      const employeeData = employeeSnap.exists()
        ? employeeSnap.val()
        : {
            firstDate: date,
            firstOperationId: operationResultId,
            lastDate: date,
            lastOperationId: operationResultId,
          }
      if (!employeeSnap.exists()) updates[employeePath] = employeeData

      if (date < employeeData.firstDate) {
        updates[`${employeePath}/firstDate`] = date
        updates[`${employeePath}/firstOperationId`] = operationResultId
      }

      if (date > employeeData.lastDate) {
        updates[`${employeePath}/lastDate`] = date
        updates[`${employeePath}/lastOperationId`] = operationResultId
      }

      // Firebase Realtime Database に更新を適用
      if (Object.keys(updates).length) {
        await database.ref().update(updates)
      }
    } catch (error) {
      logger.error(
        `SiteEmployeeHistory の更新中にエラーが発生しました: siteId=${siteId}, employeeId=${employeeId}, date=${date}`,
        error
      )
      throw new Error(`Failed to update SiteEmployeeHistory: ${error.message}`)
    }
  }

  /**
   * 指定された現場の従業員入場履歴を強制的に更新します。
   * - 従業員稼働実績ドキュメント（OperationWorkResults）を使用します。
   * - バグなどの理由で従業員入場履歴が正常に記録されていなかった場合の強制的な処理です。
   * - 大量のデータ、ドキュメントを読み込む可能性があるため、必要な時にだけ実行してください。
   * - 現場IDが指定された場合、対象の現場のみで強制更新します。
   * - 稼働実績ドキュメントが削除された際の従業員入場履歴の更新には便利です。
   *
   * @param {string} siteId 現場ID
   * @param {string} employeeId 従業員ID（オプション）
   */
  static async updateBySiteId({ siteId, employeeId }) {
    try {
      // 処理開始ログを出力
      logger.info(`[updateBySiteId] 現場の従業員入場履歴を更新します。`, {
        siteId,
        employeeId,
      })

      // 対象従業員が稼働した従業員稼働実績ドキュメントをすべて取得
      const workResultInstance = new OperationWorkResult()
      const conditions = [['where', 'siteId', '==', siteId]]
      if (employeeId) conditions.push(['where', 'employeeId', '==', employeeId])

      const workResultDocs = await workResultInstance.fetchDocs(conditions)

      // 従業員稼働実績ドキュメントが存在しなければ従業員入場履歴を削除
      if (!workResultDocs.length) {
        logger.info(
          `従業員稼働実績が存在しませんでした。従業員入場履歴を初期化して終了します。`,
          { siteId, employeeId }
        )
        const path = employeeId
          ? `SiteEmployeeHistory/${siteId}/${employeeId}`
          : `SiteEmployeeHistory/${siteId}`
        await database.ref(path).remove()
        return
      }

      // 従業員入場履歴データを作成
      const data = workResultDocs.reduce((sum, doc) => {
        const employeeData = sum[doc.employeeId] || {
          firstDate: doc.date,
          firstOperationId: doc.operationResultId,
          lastDate: doc.date,
          lastOperationId: doc.operationResultId,
        }

        if (doc.date < employeeData.firstDate) {
          employeeData.firstDate = doc.date
          employeeData.firstOperationId = doc.operationResultId
        }
        if (doc.date > employeeData.lastDate) {
          employeeData.lastDate = doc.date
          employeeData.lastOperationId = doc.operationResultId
        }

        sum[doc.employeeId] = employeeData
        return sum
      }, {})

      // 従業員入場履歴を更新（first -> last）
      const promises = []
      for (const [employeeId, obj] of Object.entries(data)) {
        const { firstDate, firstOperationId } = obj
        promises.push(
          await SiteEmployeeHistory.update({
            siteId,
            employeeId,
            date: firstDate,
            operationResultId: firstOperationId,
          })
        )
      }
      await Promise.all(promises)

      promises.splice(0)
      for (const [employeeId, obj] of Object.entries(data)) {
        const { lastDate, lastOperationId } = obj
        promises.push(
          SiteEmployeeHistory.update({
            siteId,
            employeeId,
            date: lastDate,
            operationResultId: lastOperationId,
          })
        )
      }
      await Promise.all(promises)

      // 終了ログを出力
      logger.info(`現場の従業員入場履歴を更新しました。`, {
        employeeId,
        siteId,
      })
    } catch (error) {
      const message = `[updateBySiteId] 現場の従業員入場履歴更新処理でエラーが発生しました。`
      logger.error(message, { siteId, employeeId, error })
      throw error
    }
  }

  /**
   * 引数で与えられた日時以降に作成または更新された従業員稼働実績ドキュメントを
   * もとに、現場の従業員入場履歴を更新します。
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
        `[updateByTimestamp] ${deadline} 以降に作成または更新された従業員稼働実績ドキュメントを対象に現場の従業員入場履歴を更新します。`
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

      // 対象の従業員稼働実績ドキュメントから、従業員入場履歴の元データを作成
      const data = targetDocs.reduce((result, doc) => {
        const { siteId, employeeId, date, operationResultId } = doc

        if (!result[siteId]) result[siteId] = {}

        if (!result[siteId][employeeId]) {
          result[siteId][employeeId] = {
            firstDate: date,
            firstOperationId: operationResultId,
            lastDate: date,
            lastOperationId: operationResultId,
          }
        } else {
          const employeeEntry = result[siteId][employeeId]
          if (date < employeeEntry.firstDate) {
            employeeEntry.firstDate = date
            employeeEntry.firstOperationId = operationResultId
          }
          if (date > employeeEntry.lastDate) {
            employeeEntry.lastDate = date
            employeeEntry.lastOperationId = operationResultId
          }
        }

        return result
      }, {})

      // 従業員入場履歴を更新（first -> last）
      const promises = []
      for (const [siteId, employees] of Object.entries(data)) {
        for (const [employeeId, obj] of Object.entries(employees)) {
          const { firstDate, firstOperationId } = obj
          promises.push(
            SiteEmployeeHistory.update({
              siteId,
              employeeId,
              date: firstDate,
              operationResultId: firstOperationId,
            })
          )
        }
      }
      await Promise.all(promises)

      promises.splice(0)
      for (const [siteId, employees] of Object.entries(data)) {
        for (const [employeeId, obj] of Object.entries(employees)) {
          const { lastDate, lastOperationId } = obj
          promises.push(
            SiteEmployeeHistory.update({
              siteId,
              employeeId,
              date: lastDate,
              operationResultId: lastOperationId,
            })
          )
        }
      }
      await Promise.all(promises)

      // 処理完了ログを出力
      logger.info(
        `[updateByTimestamp] 現場の従業員入場履歴の更新処理が完了しました。`
      )
    } catch (error) {
      const message = `[updateByTimestamp] 現場の従業員入場履歴更新処理でエラーが発生しました。`
      logger.error(message, { timestamp: deadline, error })
      throw error
    }
  }
}
