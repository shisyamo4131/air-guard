import { getDatabase } from 'firebase-admin/database'
import * as logger from 'firebase-functions/logger'
import dayjs from 'dayjs'
import OperationResult from './OperationResult.js'
const database = getDatabase()

/**
 * EmployeeWorkHistory クラス
 *
 * - 従業員の稼働履歴を管理し、更新するためのクラス
 *
 * /EmployeeWorkHistory
 *   |- ${employeeId}                    // 従業員ごとのルートノード
 *     |- ${YYYY}                        // 年単位のノード（例: 2024）
 *       |- ${YYYY-MM}                   // 月単位のノード（例: 2024-11）
 *         |- ${siteId}                  // 現場IDごとのノード
 *           |- firstDate: 'YYYY-MM-DD'  // 現場での最初の稼働日
 *           |- lastDate: 'YYYY-MM-DD'   // 現場での最終稼働日
 *       |- ${siteId}                    // 年単位のノードの子としても現場IDノードを持つ
 *         |- firstDate: 'YYYY-MM-DD'    // 年単位の最初の稼働日
 *         |- lastDate: 'YYYY-MM-DD'     // 年単位の最終稼働日
 *     |- ${siteId}                      // employeeId の子として siteId 別に保持
 *       |- firstDate: 'YYYY-MM-DD'      // 全期間での最初の稼働日
 *       |- lastDate: 'YYYY-MM-DD'       // 全期間での最終稼働日
 *
 */
export class EmployeeWorkHistory {
  /**
   * 指定された employeeId、siteId、date に基づいて最深部の firstDate や lastDate を更新します。
   * @param {string} employeeId - 従業員の ID
   * @param {string} date - 稼働日 (YYYY-MM-DD 形式)
   * @param {string} siteId - 現場の ID
   * @returns {Promise<void>} - 更新処理の結果を返す
   */
  static async update(employeeId, date, siteId) {
    try {
      const [year, month] = date.split('-')
      const yearMonth = `${year}-${month}`

      // 更新用オブジェクト
      const updates = {}

      // 最深部の稼働履歴データを取得
      const currentPath = `/EmployeeWorkHistory/${employeeId}/${year}/${yearMonth}/${siteId}`
      const workHistoryRef = database.ref(currentPath)
      const workHistorySnap = await workHistoryRef.get()

      // 最深部の稼働履歴データが存在しなければ date を初回稼働日、最終稼働日として扱う
      const currentData = workHistorySnap.exists()
        ? workHistorySnap.val()
        : { firstDate: date, lastDate: date }
      if (!workHistorySnap.exists()) updates[currentPath] = currentData

      // firstDate の更新
      if (date < currentData.firstDate) {
        updates[`${currentPath}/firstDate`] = date
      }

      // lastDate の更新
      if (date > currentData.lastDate) {
        updates[`${currentPath}/lastDate`] = date
      }

      // 年単位の稼働履歴データを取得
      const yearPath = `/EmployeeWorkHistory/${employeeId}/${year}/${siteId}`
      const yearRef = database.ref(yearPath)
      const yearSnap = await yearRef.get()

      // 年単位の稼働履歴データが存在しなければ date を初回稼働日、最終稼働日として扱う
      const yearData = yearSnap.exists()
        ? yearSnap.val()
        : { firstDate: date, lastDate: date }
      if (!yearSnap.exists()) updates[yearPath] = yearData

      if (date < yearData.firstDate) {
        updates[`${yearPath}/firstDate`] = date
      }

      if (date > yearData.lastDate) {
        updates[`${yearPath}/lastDate`] = date
      }

      // employeeId 配下の siteId ノードの更新
      const sitePath = `/EmployeeWorkHistory/${employeeId}/${siteId}`
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
          `EmployeeWorkHistory の更新が完了しました: employeeId=${employeeId}, date=${date}, siteId=${siteId}`
        )
      }
    } catch (error) {
      logger.error(
        `EmployeeWorkHistory の更新中にエラーが発生しました: employeeId=${employeeId}, date=${date}, siteId=${siteId}`,
        error
      )
      throw new Error(`Failed to update EmployeeWorkHistory: ${error.message}`)
    }
  }

  /**
   * 指定された月に基づいて稼働履歴を更新します。
   * @param {string} month - 更新対象の月 (YYYY-MM 形式)
   * @returns {Promise<void>} - 更新処理の結果を返す
   */
  static async updateMonthly(month) {
    const from = dayjs(`${month}-01`).startOf('month').format('YYYY-MM-DD')
    const to = dayjs(`${month}-01`).endOf('month').format('YYYY-MM-DD')

    try {
      const employeeSiteHistory =
        await OperationResult.generateEmployeeSiteHistory(from, to)

      for (const [employeeId, sites] of Object.entries(employeeSiteHistory)) {
        for (const [siteId, { firstDate, lastDate }] of Object.entries(sites)) {
          // 初回の更新を待ってから次の更新を実行
          await this.update(employeeId, firstDate, siteId)
          await this.update(employeeId, lastDate, siteId)
        }
      }
    } catch (error) {
      logger.error(
        'EmployeeWorkHistory の月次更新中にエラーが発生しました:',
        error
      )
      throw new Error(
        `EmployeeWorkHistory の月次更新に失敗しました: ${error.message}`
      )
    }
  }
}
