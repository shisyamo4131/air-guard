import { getDatabase } from 'firebase-admin/database'
import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import {
  extractDiffsFromDocUpdatedEvent,
  syncDependentDocuments,
} from '../modules/utils.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/Employee.js'
const database = getDatabase()
const firestore = getFirestore()

/**
 * 従業員情報を管理するデータモデルです。
 * - データの更新系メソッドを利用することはできません。
 * @author shisyamo4131
 */
export default class Employee extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Employees'
  static classProps = classProps

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
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

  static updateImgRef() {
    return Promise.reject(
      new Error('このクラスの updateImgRef は使用できません。')
    )
  }

  /****************************************************************************
   * initializeメソッドをオーバーライドします。
   * - AirGuardからのインポート処理を想定した初期化処理を追加しています。
   * @param {Object} item
   ****************************************************************************/
  initialize(item = {}) {
    // isForeigner が Boolean かどうかチェックし、文字列 '1' の場合には true に変換
    if (typeof item.isForeigner !== 'boolean') {
      item.isForeigner = item.isForeigner === '1' // '1' ならば true に変換
    }

    // hasSendAddress が Boolean かどうかチェックし、文字列 '2' の場合には true に変換
    if (typeof item.hasSendAddress !== 'boolean') {
      item.hasSendAddress = item.hasSendAddress === '2' // '2' ならば true に変換
    }

    super.initialize(item)
  }

  /****************************************************************************
   * Realtime Database の `AirGuard/Employees` の内容で、 Firestore の
   * Employees ドキュメントを更新します。
   * - Realtime Database からデータを取得し、そのデータに基づいて Firestore 内の
   *   Employees ドキュメントを更新します。
   * - Firestore の更新はトランザクションを使用して安全に行います。
   * - `docId` が存在しない場合や、データが存在しない場合はエラーが発生します。
   * @param {string} code - Realtime Database 内 の Employees データを識別するコード
   * @returns {Promise<void>} - 同期が正常に完了した場合は、解決されたPromiseを返します
   ****************************************************************************/
  static async syncFromAirGuard(code) {
    try {
      // Realtime Databaseから Employees データをロード
      const dbRef = database.ref(`AirGuard/Employees/${code}`)
      const data = await dbRef.get()

      // データが存在しない場合はエラーを投げる
      if (!data.exists()) {
        const message = `Realtime Database に同期元の Employees データが見つかりません。`
        logger.error(`[syncFromAirGuard] ${message}`, { code })
        throw new Error(message)
      }

      const newData = data.val()
      const docId = newData.docId

      // docIdが存在しない場合はエラーを投げる
      if (!docId) {
        const message = `Employees データに docId が設定されていません。`
        logger.error(`[syncFromAirGuard] ${message}`, { code })
        throw new Error(message)
      }

      // Firestoreドキュメントをトランザクションで同期
      await firestore.runTransaction(async (transaction) => {
        const docRef = firestore.collection('Employees').doc(docId)
        const docSnapshot = await transaction.get(docRef)

        // ドキュメントが存在しない場合はエラーを投げる
        if (!docSnapshot.exists) {
          const message = `Firestore に同期先の Employees ドキュメントが見つかりません。`
          logger.error(`[syncFromAirGuard] ${message}`, { code, docId })
          throw new Error(message)
        }

        // 既存データと新しいデータをマージし、インスタンスを作成
        // AirGuardとの同期設定済みであることを表す `sync` プロパティを true にする
        const instance = new this({
          ...docSnapshot.data(),
          ...newData,
          sync: true,
        })

        // ドキュメントを更新
        transaction.update(docRef, instance.toObject())
      })

      // 同期完了メッセージ
      logger.info(
        `[syncFromAirGuard] Realtime Database の Employees データが Firestore の Employees ドキュメントと正常に同期されました。`,
        { code, docId }
      )
    } catch (err) {
      // エラー処理を一元化し、詳細なログを出力
      logger.error(
        `[syncFromAirGuard] 同期処理でエラーが発生しました: ${err.message}`,
        { code, err }
      )
      throw err
    }
  }

  /**
   * Firestore の 'Employees' コレクションから指定された期間内に在職していた従業員ドキュメントを返します。
   *
   * @param {Object} options - オプションのフィルタ条件を含むオブジェクト。
   * @param {string | null} options.from - 期間開始日です。
   * @param {string | null} options.to - 期間終了日です。
   * @param {Object|null} options.transaction - 任意のトランザクションオブジェクト。指定がある場合はトランザクション内でクエリを実行します。
   * @returns {Promise<Array<Object>>} Firestore のデータを持つ従業員インスタンスの配列を返します。
   * @throws {Error} Firestore のクエリが失敗した場合、詳細を含むエラーがスローされます。
   */
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

/**
 * EmployeeCotract 専用の Employee クラスです。
 */
export class EmployeeForEmployeeContract extends EmployeeMinimal {
  /**
   * ドキュメントの更新トリガーイベントオブジェクトを受け取り、EmployeeContract ドキュメントの
   * employee プロパティを同期します。
   * @param {Object} event - ドキュメントの更新トリガーイベントオブジェクト
   */
  static async sync(event) {
    try {
      const differences = extractDiffsFromDocUpdatedEvent({
        event,
        ComparisonClass: this,
      })
      if (!differences.length) return
      await syncDependentDocuments(
        'EmployeeContracts',
        'employee.docId',
        'employee',
        differences.data
      )
    } catch (error) {
      logger.error(
        `EmployeeContract ドキュメントの employee プロパティの同期処理に失敗しました。`
      )
      throw new Error(error)
    }
  }
}
