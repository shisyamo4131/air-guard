import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/EmployeeContract.js'
import Employee from './Employee.js'
import WorkRegulation from './WorkRegulation.js'
const firestore = getFirestore()

/**
 * EmployeeContractsドキュメントデータモデル
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-08 - 初版作成
 */
export default class EmployeeContract extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'EmployeeContracts'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    employee: Employee,
    workRegulation: WorkRegulation,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.create
    delete this.update
    delete this.delete
  }

  /****************************************************************************
   * 指定された従業員の期間内に適用する可能性がある雇用契約データを取得します。
   *
   * この関数は、指定された従業員IDに基づいて、`from` より前に開始された最新の雇用契約と、
   * `from` から `to` の期間内に開始されたすべての雇用契約を取得します。
   * - `from` より前の雇用契約は、最新の1件のみ取得されます。
   * - `from` 以降、`to` 以前の雇用契約は、すべて取得されます。
   * - Firestoreのトランザクションが提供されている場合、その中でクエリが実行されます。
   *
   * @param {Object} options - クエリオプションを含むオブジェクト。
   * @param {Object} options.transaction - Firestoreのトランザクションオブジェクト。
   * @param {string} options.employeeId - 対象従業員のID。
   * @param {string} options.from - 取得する期間の開始日（YYYY-MM-DD形式）。
   * @param {string} options.to - 取得する期間の終了日（YYYY-MM-DD形式）。
   * @returns {Promise<Array<Object>>} - 雇用契約データの配列を返します。
   * @throws {Error} - 必須パラメータが不足しているか、Firestoreクエリの実行中にエラーが発生した場合にスローされます。
   ****************************************************************************/
  static async getEmployeeContracts({
    employeeId = null,
    from = null,
    to = null,
    transaction = null,
  } = {}) {
    // employeeId, from, to がすべて指定されているか確認
    if (!employeeId || !from || !to) {
      const message = `[getEmployeeContracts] 従業員IDと取得する期間の指定が必要です。`
      logger.error(message, { employeeId, from, to })
      throw new Error(message)
    }

    try {
      // converter を使用するため、インスタンスを用意
      const instance = new this()

      const baseRef = firestore
        .collection('EmployeeContracts')
        .where('employeeId', '==', employeeId)

      // from より前の雇用契約を取得するクエリ
      const beforeQuery = baseRef
        .where('startDate', '<', from)
        .orderBy('startDate', 'desc')
        .limit(1)
        .withConverter(instance.converter())
      const beforeQuerySnapshot = transaction
        ? await transaction.get(beforeQuery)
        : await beforeQuery.get()

      // from 以降、to 以前の雇用契約を取得するクエリ
      const afterQuery = baseRef
        .where('startDate', '>=', from)
        .where('startDate', '<=', to)
        .withConverter(instance.converter())
      const afterQuerySnapshot = transaction
        ? await transaction.get(afterQuery)
        : await afterQuery.get()

      const before = beforeQuerySnapshot.docs.map((doc) => doc.data())
      const after = afterQuerySnapshot.docs.map((doc) => doc.data())

      return before.concat(after) // 前後の契約データを結合して返す
    } catch (error) {
      const message = `[getEmployeeContracts] 従業員の雇用契約情報の取得時にエラーが発生しました。`
      logger.error(message, { employeeId, from, to, error })
      throw error
    }
  }
}
