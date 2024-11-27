import { getDatabase } from 'firebase-admin/database'
import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'

const database = getDatabase()
const firestore = getFirestore()

/**
 * Realtime Database で管理される `Employees` のデータモデルです。
 * - コンストラクタの引数には `Employees` ドキュメントのデータを渡します。
 * @author shisyamo4131
 */
export default class EmployeeIndex {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    this.code = item.code ?? ''
    this.fullName = item.fullName ?? ''
    this.fullNameKana = item.fullNameKana ?? ''
    this.abbr = item.abbr ?? ''
    this.abbrKana = item.abbrKana ?? ''
    this.address1 = item.address1 ?? ''
    this.address2 = item.address2 ?? ''
    this.mobile = item.mobile ?? ''
    this.status = item.status ?? ''
    this.contractType = item.contractType ?? ''
    this.designation = item.designation ?? ''
    this.sync = item.sync ?? false
    this.hasSecurityRegistration = item.hasSecurityRegistration ?? false
  }

  /****************************************************************************
   * toObject
   ****************************************************************************/
  toObject() {
    return { ...this }
  }

  /****************************************************************************
   * Realtime Database に指定された従業員のインデックスデータを作成します。
   * @param {string} employeeId - インデックス作成対象の従業員ID
   ****************************************************************************/
  static async create(employeeId) {
    const dbRef = database.ref(`Employees/${employeeId}`)

    try {
      const docRef = firestore.collection('Employees').doc(employeeId)
      const docSnapshot = await docRef.get()

      if (!docSnapshot.exists) {
        const message = `該当する従業員ドキュメントが取得できませんでした。`
        logger.error(`[create] ${message}`, { employeeId })
        throw new Error(message)
      }

      const indexData = new this(docSnapshot.data())

      await dbRef.set(indexData)
    } catch (error) {
      logger.error(`[create] インデックスの作成処理でエラーが発生しました。`, {
        employeeId,
      })
      throw error
    }
  }

  /****************************************************************************
   * Realtime Database から指定された従業員のインデックスデータを削除します。
   * @param {string} employeeId - インデックス削除対象の従業員ID
   ****************************************************************************/
  static async delete(employeeId) {
    const dbRef = database.ref(`Employees/${employeeId}`)

    try {
      await dbRef.remove()
    } catch (error) {
      logger.error(`[delete] インデックスの削除処理でエラーが発生しました。`, {
        employeeId,
      })
      throw error
    }
  }
}
