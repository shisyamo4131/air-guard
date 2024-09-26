/****************************************************************************
 * Realtime Databaseに登録されているAirGuardのマスタデータを受け取り、
 * 対応するFirestoreドキュメントの同期処理を行うモジュールを提供します。
 *
 * 主な機能:
 * - `AirGuard/Customers/{code}`が更新された際のFirestoreドキュメント同期
 * - `AirGuard/Sites/{code}`が更新された際のFirestoreドキュメント同期
 * - `AirGuard/Employees/{code}`が更新された際のFirestoreドキュメント同期
 *
 * 同期処理はそれぞれのデータのdocIdをもとに行われ、Firestore上の
 * ドキュメントを更新するために使用されます。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @created 2024-09-09
 ****************************************************************************/

import { info, error } from 'firebase-functions/logger'
import Customer from '../models/Customer.js'
import Site from '../models/Site.js'
import Employee from '../models/Employee.js'

/****************************************************************************
 * Realtime Databaseの`AirGuard/Customers`の内容で、FirestoreのCustomersドキュメントを更新します。
 * @param {Object} data Realtime Databaseの更新トリガーが保有するdataオブジェクト
 * @returns {Promise<void>} Firestoreの更新結果を返します
 ****************************************************************************/
export const syncAirGuardCustomerToFirestore = async (data) => {
  const functionName = '[syncAirGuardCustomerToFirestore]'
  try {
    const docId = data.docId
    // Customerインスタンスを作成し、データを取得
    const instance = new Customer()
    await instance.fetch(docId)
    // インスタンスのデータを更新し、同期フラグをセット
    instance.initialize({ ...instance.toObject(), ...data, sync: true })
    // Firestoreドキュメントを更新
    await instance.update()
  } catch (err) {
    // エラーハンドリング
    error(
      `${functionName} Firestoreドキュメントとの同期中にエラーが発生しました: ${err.message}`,
      { err }
    )
    throw err
  }
}

/****************************************************************************
 * Realtime Databaseの`AirGuard/Sites`の内容で、FirestoreのSitesドキュメントを更新します。
 * 顧客コードを使用して顧客情報を同期します。
 * @param {Object} data Realtime Databaseの更新トリガーが保有するdataオブジェクト
 * @returns {Promise<void>} Firestoreの更新結果を返します
 ****************************************************************************/
export const syncAirGuardSiteToFirestore = async (data) => {
  const functionName = '[syncAirGuardSiteToFirestore]'

  /**
   * 顧客コードを使用して顧客ドキュメントを取得します。
   * @param {string} code 顧客コード
   * @returns {Promise<Object>} 顧客情報を返します
   * @throws 顧客が見つからない場合にエラーをスローします
   */
  const getCustomerByCode = async (code) => {
    try {
      const customerInstance = new Customer()
      const customers = await customerInstance.fetchByCode(code)
      if (!customers.length) {
        throw new Error(
          `${functionName} Could not find customer document(s). code: ${code}`
        )
      }
      return customers[0] // 顧客情報を返す
    } catch (err) {
      // エラーが発生した場合、ログを記録しエラーを再スロー
      error(
        `${functionName} Error while fetching customer by code: ${err.message}`,
        { err }
      )
      throw err
    }
  }

  try {
    const docId = data.docId
    // Siteインスタンスを作成し、データを取得
    const instance = new Site()
    await instance.fetch(docId)
    // 顧客コードを使用して顧客情報を取得
    const customer = await getCustomerByCode(data.customerCode)
    // インスタンスのデータを更新し、同期フラグをセット
    instance.initialize({
      ...instance.toObject(),
      ...data,
      customer,
      customerId: customer.docId,
      sync: true,
    })
    // Firestoreドキュメントを更新
    await instance.update()
    // 正常に完了した場合のログを記録
    info(
      `${functionName} Firestoreドキュメントとの同期が正常に完了しました。`,
      { docId }
    )
  } catch (err) {
    // Firestoreとの同期中にエラーが発生した場合、エラーログを記録
    error(
      `${functionName} Firestoreドキュメントとの同期中にエラーが発生しました: ${err.message}`,
      { err }
    )
    throw err
  }
}

/****************************************************************************
 * Realtime Databaseの`AirGuard/Employees`の内容で、FirestoreのEmployeesドキュメントを更新します。
 * @param {Object} data Realtime Databaseの更新トリガーが保有するdataオブジェクト
 * @returns {Promise<void>} Firestoreの更新結果を返します
 ****************************************************************************/
export const syncAirGuardEmployeeToFirestore = async (data) => {
  const functionName = '[syncAirGuardEmployeeToFirestore]'

  try {
    const docId = data.docId
    // Employeeインスタンスを作成し、データを取得
    const instance = new Employee()
    await instance.fetch(docId)

    // インスタンスのデータを更新し、同期フラグといくつかのプロパティをセット
    instance.initialize({
      ...instance.toObject(),
      ...data,
      isForeigner: data.isForeigner === '1', // '1' ならば true に変換
      hasSendAddress: data.hasSendAddress === '2', // '2' ならば true に変換
      sync: true,
    })

    // Firestoreドキュメントを更新
    await instance.update()

    info(
      `${functionName} Firestoreドキュメントとの同期が正常に完了しました。`,
      { docId }
    )
  } catch (err) {
    // Firestoreとの同期中にエラーが発生した場合、エラーログを記録
    error(
      `${functionName} Firestoreドキュメントとの同期中にエラーが発生しました: ${err.message}`,
      { err }
    )
  }
}
