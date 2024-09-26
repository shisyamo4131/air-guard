import { info, error } from 'firebase-functions/logger'
import { getDatabase } from 'firebase-admin/database'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/Employee.js'

/**
 * Employeesドキュメントデータモデル【論理削除】
 *
 * - 従業員情報を管理するデータモデルです。
 * - `code`は Autonumbers による自動採番が行われます。
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class Employee extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Employees'
  static useAutonumber = true
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['lastNameKana', 'firstNameKana', 'abbr']
  static hasMany = [
    {
      collection: 'EmployeeContracts',
      field: 'employeeId',
      condition: '==',
      type: 'collection',
    },
    {
      collection: 'EmployeeMedicalCheckups',
      field: 'employeeId',
      condition: '==',
      type: 'collection',
    },
    {
      collection: 'OperationResults',
      field: 'employeeId',
      condition: 'array-contains',
      type: 'collection',
    },
  ]

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.create
    delete this.update
    delete this.delete
    Object.defineProperties(this, {
      fullName: {
        enumerable: true,
        get() {
          if (!this.lastName || !this.firstName) return ''
          return `${this.lastName} ${this.firstName}`
        },
        set(v) {},
      },
      fullNameKana: {
        enumerable: true,
        get() {
          if (!this.lastNameKana || !this.firstNameKana) return ''
          return `${this.lastNameKana} ${this.firstNameKana}`
        },
        set(v) {},
      },
    })
  }

  /****************************************************************************
   * クラスプロパティの状態に応じて、他のプロパティの値を初期化します。
   * - `isForeigner`がfalseの場合、`nationality`を初期化します。
   * - `leaveDate`が空の場合、`leaveReason`を初期化します。
   * - `hasSendAddress`がfalseの場合、`sendZipcode`、`sendAddress1`、`sendAddress2`に
   *   `zipcode`、`address1`、`address2`をセットします。
   ****************************************************************************/
  #initializeDependentProperties() {
    if (!this.isForeigner) this.nationality = ''
    if (!this.leaveDate) this.leaveReason = ''
    // 送付先住所がなければ登録住所を送付先住所に複製
    if (!this.hasSendAddress) {
      this.sendZipcode = this.zipcode
      this.sendAddress1 = this.address1
      this.sendAddress2 = this.address2
    }
  }

  /****************************************************************************
   * FireModelのbeforeCreateをオーバーライドします。
   * - 依存プロパティを初期化します。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeCreate() {
    this.#initializeDependentProperties()
    await super.beforeCreate()
  }

  /****************************************************************************
   * FireModelのbeforeUpdateをオーバーライドします。
   * - 依存プロパティを初期化します。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeUpdate() {
    this.#initializeDependentProperties()
    await super.beforeUpdate()
  }

  /****************************************************************************
   * 指定された従業員codeに該当する従業員ドキュメントデータを配列で返します。
   * @param {string} code - 従業員コード
   * @returns {Promise<Array>} - 従業員ドキュメントデータの配列
   * @throws {Error} - エラーが発生した場合にスローされます
   ****************************************************************************/
  async fetchByCode(code) {
    if (!code) throw new Error('従業員コードは必須です。')
    try {
      const constraints = [['where', 'code', '==', code]]
      const snapshots = await this.fetchDocs(constraints)
      return snapshots
    } catch (err) {
      const message = `[Employee.js fetchByCode] 従業員コード ${code} に対するドキュメントの取得に失敗しました: ${err.message}`
      error(message)
      throw new Error(message)
    }
  }

  /****************************************************************************
   * 従業員codeの配列を受け取り、該当する従業員ドキュメントデータを配列で返します。
   * 従業員codeの配列は、重複があれば一意に整理されます。
   * @param {Array<string>} codes - 従業員コードの配列
   * @returns {Promise<Array>} - 従業員ドキュメントデータの配列
   * @throws {Error} - 処理中にエラーが発生した場合にスローされます
   ****************************************************************************/
  async fetchByCodes(codes) {
    if (!Array.isArray(codes) || codes.length === 0) return []
    try {
      const unique = [...new Set(codes)]
      const chunked = unique.flatMap((_, i) =>
        i % 30 ? [] : [unique.slice(i, i + 30)]
      )
      const promises = chunked.map((arr) => {
        const constraints = [['where', 'code', 'in', arr]]
        return this.fetchDocs(constraints)
      })
      const snapshots = await Promise.all(promises)
      return snapshots.flat()
    } catch (err) {
      const message = `[Employee.js fetchByCodes] ドキュメントの取得中にエラーが発生しました: ${err.message}`
      error(message)
      throw new Error(message)
    }
  }

  /****************************************************************************
   * Realtime DatabaseのEmployeesインデックスを更新します。
   * - 指定されたdocIdに対応するEmployeesインデックスをRealtime Databaseに作成・更新します。
   * - 入力データのバリデーションを行い、エラー時にはメッセージを出力します。
   *
   * @param {string} docId - 更新するEmployeesインデックスのドキュメントID
   * @param {object} data - 更新するデータ
   * @throws {Error} インデックスの更新に失敗した場合、エラーをスローします。
   ****************************************************************************/
  static async syncIndex(docId, data) {
    // Input validation for docId and data
    if (!docId || typeof docId !== 'string') {
      throw new Error(`[${this.name} - syncIndex]: Invalid document ID`)
    }
    if (!data || typeof data !== 'object') {
      throw new Error(`[${this.name} - syncIndex]: Invalid data object`)
    }

    // Create a new data for the index
    const indexData = {
      code: data.code,
      fullName: data.fullName,
      fullNameKana: data.fullNameKana,
      abbr: data.abbr,
      status: data.status,
    }

    try {
      // Update the Realtime Database Employees index
      const database = getDatabase()
      await database.ref(`Employees/${docId}`).set(indexData)

      info(
        `[${this.name} - syncIndex]: Successfully updated index for docId: ${docId}`
      )
    } catch (err) {
      error(
        `[${this.name} - syncIndex]: Failed to update index for docId: ${docId}`,
        err
      )
      throw new Error(
        `[${this.name} - syncIndex]: Error updating index for docId: ${docId}`
      )
    }
  }

  /****************************************************************************
   * Realtime DatabaseのEmployeesインデックスを削除します。
   * - 指定されたdocIdに対応するEmployeesインデックスをRealtime Databaseから削除します。
   *
   * @param {string} docId - 削除するEmployeesインデックスのドキュメントID
   * @throws {Error} インデックスの削除に失敗した場合、エラーをスローします。
   ****************************************************************************/
  static async deleteIndex(docId) {
    // docIdのバリデーション
    if (!docId || typeof docId !== 'string') {
      throw new Error(`[${this.name} - deleteIndex]: Invalid document ID`)
    }

    try {
      // Realtime DatabaseのEmployeesインデックスを削除
      const database = getDatabase()
      await database.ref(`Employees/${docId}`).remove()

      // ログ: 削除成功
      info(
        `[${this.name} - deleteIndex]: Successfully deleted index for docId: ${docId}`
      )
    } catch (err) {
      // ログ: 削除失敗
      error(
        `[${this.name} - deleteIndex]: Failed to delete index for docId: ${docId}`,
        err
      )
      throw new Error(
        `[${this.name} - deleteIndex]: Error deleting index for docId: ${docId}`
      )
    }
  }
}
