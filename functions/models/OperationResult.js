import { getFirestore } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/OperationResult.js'
const firestore = getFirestore()

/**
 * ## OperationResult
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-18 - 初版作成
 */
export default class OperationResult extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'OperationResults'
  static classProps = classProps

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.create
    delete this.update
    delete this.delete
  }

  /**
   * 指定された期間内の OperationResults コレクションを取得し、
   * employeeId/siteId/{firstDate, lastDate} 形式のオブジェクトを生成します。
   * @param {string} from - 取得開始日 (YYYY-MM-DD 形式)
   * @param {string} to - 取得終了日 (YYYY-MM-DD 形式)
   * @returns {Promise<Object>} - 生成されたオブジェクト
   */
  static async generateEmployeeSiteHistory(from, to) {
    try {
      const operationResultsRef = firestore.collection('OperationResults')
      const queryRef = operationResultsRef
        .where('date', '>=', from)
        .where('date', '<=', to)

      const snapshot = await queryRef.get()
      const history = {}

      snapshot.forEach((doc) => {
        const { date, siteId, employeeIds } = doc.data()

        employeeIds.forEach((employeeId) => {
          if (!history[employeeId]) {
            history[employeeId] = {}
          }

          if (!history[employeeId][siteId]) {
            history[employeeId][siteId] = { firstDate: date, lastDate: date }
          } else {
            // firstDate の更新
            if (date < history[employeeId][siteId].firstDate) {
              history[employeeId][siteId].firstDate = date
            }
            // lastDate の更新
            if (date > history[employeeId][siteId].lastDate) {
              history[employeeId][siteId].lastDate = date
            }
          }
        })
      })
      return history
    } catch (error) {
      logger.error('従業員の現場履歴生成中にエラーが発生しました:', error)
      throw new Error(`従業員の現場履歴の生成に失敗しました: ${error.message}`)
    }
  }
}
