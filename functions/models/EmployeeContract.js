import { getFirestore } from 'firebase-admin/firestore'
import { getDatabase } from 'firebase-admin/database'
import { logger } from 'firebase-functions/v2'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/EmployeeContract.js'
import { EmployeeForEmployeeContract } from './Employee.js'
import WorkRegulation, {
  WorkRegulationForDailyAttendance,
} from './WorkRegulation.js'
import EmployeeAllowance from './EmployeeAllowance.js'
const firestore = getFirestore()
const database = getDatabase()

/**
 * Cloud Functions で Firestore の EmployeeContracts ドキュメントを操作するためのクラスです。
 * FireMode を継承していますが、更新系のメソッドは利用できません。
 * @author shisyamo4131
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
    employee: EmployeeForEmployeeContract,
    workRegulation: WorkRegulation,
    allowances: EmployeeAllowance,
  }

  /****************************************************************************
   * 更新系メソッドは使用不可
   ****************************************************************************/
  create() {
    return Promise.reject(new Error('このクラスの create は使用できません。'))
  }

  update() {
    return Promise.reject(new Error('このクラスの update は使用できません。'))
  }

  delete() {
    return Promise.reject(new Error('このクラスの delete は使用できません。'))
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

/**
 * 他のドキュメントで不要になるプロパティを排除した EmployeeContract クラスです。
 */
export class EmployeeContractMinimal extends EmployeeContract {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.tokenMap
    delete this.createAt
    delete this.updateAt
    delete this.uid
    delete this.remarks
  }
}

/**
 * 従業員別の最新の雇用契約情報を管理するために、更に不要なプロパティを排除した
 * EmployeeContract クラスです。
 * - Realtime Database の従業員別最新雇用契約データを管理するために使用されます。
 */
export class EmployeeContractLatest extends EmployeeContractMinimal {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    // クラスで必要になるプロパティリスト
    const keepProps = [
      'docId',
      'employeeId',
      'startDate',
      'hasPeriod',
      'expiredDate',
    ]

    // 不要なプロパティを削除
    Object.keys(this).forEach((key) => {
      if (!keepProps.includes(key)) delete this[key]
    })
  }

  /****************************************************************************
   * 指定された従業員の、従業員別最新雇用契約データを削除します。
   * @param {string} employeeId - 対象の従業員ID
   ****************************************************************************/
  static async remove(employeeId) {
    const contractRef = database.ref(`EmployeeContractLatest/${employeeId}`)
    try {
      await contractRef.remove()
      logger.log(
        `従業員別最新雇用契約データを削除しました。従業員ID: ${employeeId}`
      )
    } catch (error) {
      logger.error(
        `従業員別最新雇用契約データの削除処理に失敗しました。従業員ID: ${employeeId}`
      )
    }
  }

  /****************************************************************************
   * 指定された従業員の最新の雇用契約ドキュメントを Firestore から取得します。
   * @param {string} employeeId - 対象の従業員ID
   * @returns
   ****************************************************************************/
  static async fetchLatest(employeeId) {
    try {
      const snapshot = await firestore
        .collection('EmployeeContracts')
        .where('employeeId', '==', employeeId)
        .orderBy('startDate', 'desc')
        .limit(1)
        .get()
      return snapshot.empty ? null : snapshot.docs[0].data()
    } catch (error) {
      logger.error(
        `従業員の最新雇用契約ドキュメントの取得に失敗しました。従業員ID: ${employeeId}`
      )
    }
  }

  /****************************************************************************
   * 指定された従業員の最新の雇用契約を取得し、Realtime Database に保存します。
   * - 対象の従業員が退職済みであった場合、または該当する雇用契約情報が存在しなかった場合
   *   Realtime Database からデータが削除されます。
   * @param {string} employeeId - 従業員ID
   ****************************************************************************/
  static async sync(employeeId) {
    const contractRef = database.ref(`EmployeeContractLatest/${employeeId}`)

    try {
      // 指定された従業員ドキュメントを取得
      const employeeSnapshot = await firestore
        .collection('Employees')
        .doc(employeeId)
        .get()

      // 従業員ドキュメントが存在しなかった場合は警告を出力してデータを削除、終了
      if (!employeeSnapshot.exists) {
        logger.warn(
          `Employees コレクションに対象のドキュメントが存在しません。従業員ID: ${employeeId}`
        )
        await this.remove(employeeId)
        return
      }

      // 在職中でない場合はデータを削除して終了
      const status = employeeSnapshot.data().status
      if (status !== 'active') {
        await this.remove(employeeId)
        return
      }

      // 最新の雇用契約ドキュメントを取得
      const latestContract = await this.fetchLatest(employeeId)

      // 雇用契約ドキュメントが存在しなければデータを削除して数量
      if (!latestContract) {
        await this.remove(employeeId)
        return
      }

      // 最新の雇用契約情報を Realtime Database に保存
      const instance = new this(latestContract)
      await contractRef.set(instance.toObject ? instance.toObject() : instance)
    } catch (error) {
      logger.error(
        `従業員（ID: ${employeeId}）の最新の雇用契約情報同期処理に失敗しました。`,
        {
          error,
        }
      )
      throw error
    }
  }
}

/**
 * DailyAttendance クラスのカスタムクラス用 EmployeeContract クラスです。
 * - Minimal クラスから更に employee プロパティを削除しています。
 */
export class EmployeeContractForDailyAttendance extends EmployeeContractMinimal {
  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    workRegulation: WorkRegulationForDailyAttendance,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.employee
  }
}
