import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import {
  createIndex,
  removeIndex,
  syncToFirestoreFromAirGuard,
} from '../modules/database.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/Employee.js'
import SecurityRegistration from './SecurityRegistration.js'
const firestore = getFirestore()

/**
 * Cloud Functions で Firestore の Employees ドキュメントを操作するためのクラスです。
 * FireMode を継承していますが、更新系のメソッドは利用できません。
 * @author shisyamo4131
 */
export default class Employee extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Employees'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    securityRegistration: SecurityRegistration,
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
   * Realtime Databaseの`AirGuard/Employees`の内容で、FirestoreのEmployeesドキュメントを更新します。
   * @param {string} code - Realtime Database内のEmployeesデータを識別するコード
   * @returns {Promise<void>} - 同期が正常に完了した場合は、解決されたPromiseを返します
   ****************************************************************************/
  static async syncFromAirGuard(code) {
    try {
      const converter = (item) => {
        return {
          ...item,
          isForeigner: item.isForeigner === '1',
          hasSendAddress: item.hasSendAddress === '2',
          hasSecurityRegistration: !!item.registrationDate,
          securityRegistration: {
            // 警備員登録日
            registrationDate: item.registrationDate ?? '',

            // 警備経験開始日
            securityStartDate: item.securityStartDate ?? '',

            // ブランク
            blankMonths: parseInt(item.blankMonths ?? 0),

            // 本籍地
            honseki: item.honseki ?? '',

            // 緊急連絡先氏名
            emergencyContactName: item.emergencyContactName ?? '',

            // 緊急連絡先続柄
            emergencyContactRelation: item.emergencyContactRelation ?? '',

            // 緊急連絡先続柄詳細
            emergencyContactRelationDetail:
              item.emergencyContactRelationDetail ?? '',

            // 緊急連絡先住所
            emergencyContactAddress: item.emergencyContactAddress ?? '',

            // 緊急連絡先電話番号
            emergencyContactTel: item.emergencyContactTel ?? '',
          },
        }
      }
      await syncToFirestoreFromAirGuard(code, 'Employees', this, converter)
    } catch (err) {
      logger.error(err, { code })
      throw err
    }
  }

  /****************************************************************************
   * Firestore の 'Employees' コレクションから指定された期間内に在職していた従業員ドキュメントを返します。
   *
   * @param {Object} options - オプションのフィルタ条件を含むオブジェクト。
   * @param {string | null} options.from - 期間開始日です。
   * @param {string | null} options.to - 期間終了日です。
   * @param {Object|null} options.transaction - 任意のトランザクションオブジェクト。指定がある場合はトランザクション内でクエリを実行します。
   * @returns {Promise<Array<Object>>} Firestore のデータを持つ従業員インスタンスの配列を返します。
   * @throws {Error} Firestore のクエリが失敗した場合、詳細を含むエラーがスローされます。
   ****************************************************************************/
  static async getExistingEmployees({ from, to, transaction = null } = {}) {
    // 引数のチェック
    if (!from || !to) {
      const message = `[getExistingEmployees] 必要な引数が指定されていません。`
      logger.error(message, { from, to })
      throw new Error(`${message}`)
    }

    const instance = new this()

    try {
      // Firestoreの 'Employees' コレクションの参照を取得
      const colRef = firestore.collection('Employees')

      /**
       * 期間中に在籍していた従業員ドキュメントを取得
       * - 条件1) 処理時点で hireDate が to 以前、かつ leaveDate が設定されていない -> 現在在職中で、期間終了日以前に雇い入れられた従業員
       * - 条件2) 処理時点で hireDate が to 以前、かつ leaveDate が from 以降 -> 現在退職済みだが、退職日が期間開始日以降
       * 上記それぞれの条件で取得した ドキュメント を結合すると期間中に在籍していた従業員リストになる。
       */
      // 条件1)
      const activeEmployeesQueryRef = colRef
        .where('hireDate', '<=', to)
        .where('leaveDate', '==', '')
        .withConverter(instance.converter())
      const activeEmployeesQuerySnapshot = transaction
        ? await transaction.get(activeEmployeesQueryRef)
        : await activeEmployeesQueryRef.get()
      const activeEmployees = activeEmployeesQuerySnapshot.docs.map((doc) =>
        doc.data()
      )

      // 条件2)
      const leaveEmployeesQueryRef = colRef
        .where('hireDate', '<=', to)
        .where('leaveDate', '>=', from)
        .withConverter(instance.converter())
      const leaveEmployeesQuerySnapshot = transaction
        ? await transaction.get(leaveEmployeesQueryRef)
        : await leaveEmployeesQueryRef.get()
      const leaveEmployees = leaveEmployeesQuerySnapshot.docs.map((doc) =>
        doc.data()
      )

      // 結合して返す
      return activeEmployees.concat(leaveEmployees)
    } catch (error) {
      const message = `[getExistingEmployees] 不明なエラーが発生しました。`
      logger.error(message, { from, to, error })
      throw error
    }
  }
}

/**
 * Realtime Database で管理する Employee インデックス用のクラスです。
 */
export class EmployeeIndex extends Employee {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    // インデックスに必要なプロパティを定義
    const keepProps = [
      'code',
      'fullName',
      'fullNameKana',
      'abbr',
      'abbrKana',
      'address1',
      'address2',
      'mobile',
      'status',
      'contractType',
      'designation',
      'sync',
      'hasSecurityRegistration',
    ]

    // Customer クラスから不要なプロパティを削除
    Object.keys(this).forEach((key) => {
      if (!keepProps.includes(key)) delete this[key]
    })
  }

  /****************************************************************************
   * Realtime Database にインデックスを作成します。
   * @param {string} EmployeeId - インデックス作成対象の取引先ID
   ****************************************************************************/
  static async create(EmployeeId) {
    const functionName = 'create'
    try {
      await createIndex('Employees', EmployeeId, this)
    } catch (error) {
      logger.error(`[${functionName}] ${error.message}`, { EmployeeId })
      throw error
    }
  }

  /****************************************************************************
   * Realtime Database からインデックスを削除します。
   * @param {string} customerId - インデックス削除対象の取引先ID
   ****************************************************************************/
  static async remove(customerId) {
    const functionName = 'remove'
    try {
      await removeIndex('Employees', customerId)
    } catch (error) {
      logger.error(`[${functionName}] ${error.message}`, { customerId })
      throw error
    }
  }
}

/**
 * 他のドキュメントで不要なプロパティを排除した Employee クラスです。
 */
export class EmployeeMinimal extends Employee {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.createAt
    delete this.updateAt
    delete this.remarks
    delete this.tokenMap
  }
}
