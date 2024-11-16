import { getDatabase } from 'firebase-admin/database'
import { logger } from 'firebase-functions/v2'

const database = getDatabase()

const cleanUpPaths = [
  'Placements',
  'Placements/assignments/employeeAvailability',
  'Placements/assignments/employees',
  'Placements/assignments/outsourcers',
  'Placements/assignments/sites',
]

/**
 * Placementsドキュメントデータモデル
 *
 * @author shisyamo4131
 */
export default class Placement {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor({ date, siteId, workShift }) {
    this.setDate(date)
    this.setSiteId(siteId)
    this.setWorkShift(workShift)
  }

  /****************************************************************************
   * date プロパティをセットします。
   * @param {string} date - YYYY-MM-DD 形式の文字列
   * @throws {TypeError} date が文字列でない場合にエラーをスローします。
   ****************************************************************************/
  setDate(date) {
    if (date && typeof date !== 'string') {
      const message = `setDate requires a string argument. Received ${date}`
      console.error(message) // eslint-disable-line no-console
      throw new TypeError(message)
    }

    this.date = date
  }

  /****************************************************************************
   * siteId プロパティをセットします。
   * @param {string} siteId - 現場ID
   * @throws {TypeError} siteId が文字列でない場合にエラーをスローします。
   ****************************************************************************/
  setSiteId(siteId) {
    if (siteId && typeof siteId !== 'string') {
      const message = `setSiteId requires a string argument. Received ${siteId}`
      console.error(message) // eslint-disable-line no-console
      throw new TypeError(message)
    }

    this.siteId = siteId
  }

  /****************************************************************************
   * workShift プロパティをセットします。
   * @param {string} workShift - 勤務区分
   * @throws {TypeError} 勤務区分が文字列でない場合にエラーをスローします。
   * @throws {Error} 勤務区分が `day` または `night` でない場合にエラーをスローします。
   ****************************************************************************/
  setWorkShift(workShift) {
    if (workShift && typeof workShift !== 'string') {
      const message = `setWorkShift requires a string argument. Received ${workShift}`
      console.error(message) // eslint-disable-line no-console
      throw new TypeError(message)
    }

    if (!['day', 'night'].includes(workShift)) {
      const message = `A workShift must be 'day' or 'night'. Received ${workShift}`
      console.error(message) // eslint-disable-line no-console
      throw new Error(message)
    }

    this.workShift = workShift
  }

  /****************************************************************************
   * 指定された日以前の配置情報データを削除します。
   * @param {string} deadline - 削除対象となる締切日（YYYY-MM-DD形式）
   ****************************************************************************/
  static async cleanUp(deadline) {
    const message = `[Placement - cleanUp] ${deadline} 以前の配置情報データを削除します。`
    logger.log(message)
    const updates = {}
    try {
      // 各パスについて処理を繰り返す
      for (const path of cleanUpPaths) {
        const snapshot = await database
          .ref(path)
          .orderByKey()
          .endAt(deadline)
          .get()

        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            updates[`${path}/${childSnapshot.key}`] = null
          })
        }
      }

      // まとめて削除を実行
      if (Object.keys(updates).length > 0) {
        await database.ref().update(updates)
        const message = `[Placement - cleanUp] 削除処理が正常に完了しました。対象: ${
          Object.keys(updates).length
        } 個のノード`
        logger.log(message)
      } else {
        logger.log('[Placement - cleanUp] 削除対象のデータは存在しません。')
      }
    } catch (error) {
      logger.error(
        '[Placement - cleanUp] データ削除中にエラーが発生しました:',
        error
      )
      throw error
    }
  }
}
