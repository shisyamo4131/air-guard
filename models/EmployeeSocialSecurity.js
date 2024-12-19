import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/EmployeeSocialSecurity'
import { EmployeeMinimal } from './Employee'

/**
 * 従業員の社会保障データモデル
 * - ドキュメントIDは `${従業員ID}` で固定です。
 *
 * @author shisyamo4131
 */
export default class EmployeeSocialSecurity extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'EmployeeSocialSecurities'
  static useAutonumber = false
  static logicalDelete = true
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    employee: EmployeeMinimal,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.tokenMap
  }

  /****************************************************************************
   * beforeCreate をオーバーライドします。
   ****************************************************************************/
  async beforeCreate() {
    const funcName = '[EmployeeSocialSecurity - beforeCreate]'
    if (!this.employeeId) {
      throw new Error(`${funcName} 従業員が指定されていません。`)
    }
    const employee = new EmployeeMinimal()
    const fetched = await employee.fetch(this.employeeId)
    if (!fetched) {
      throw new Error(`${funcName} 従業員ドキュメントが取得できませんでした。`)
    }
    this.employee = employee
  }

  /****************************************************************************
   * beforeUpdate をオーバーライドします。
   ****************************************************************************/
  beforeUpdate() {
    const funcName = '[EmployeeSocialSecurity - beforeUpdate]'
    return new Promise((resolve, reject) => {
      if (!this.employeeId) {
        const error = new Error(`${funcName} 従業員が指定されていません。`)
        reject(error)
      }
      if (this.employeeId !== this.employee.docId) {
        const error = new Error(`${funcName} 従業員は変更できません。`)
        reject(error)
      }
      resolve()
    })
  }

  /****************************************************************************
   * create メソッドをオーバーライドします。
   * - ドキュメントIDを固定します。
   * @param {Object} [options={}] - オプション引数
   * @param {Object|null} [options.transaction=null] - Firestore のトランザクションオブジェクト。指定しない場合は自動トランザクションを使用します。
   * @param {function|null} [callBack=null] - 追加のトランザクション処理です。引数にトランザクションオブジェクトが渡されます。
   ****************************************************************************/
  async create({ transaction = null } = {}, callBack = null) {
    const docId = this.employeeId
    return await super.create(
      { docId, useAutonumber: false, transaction },
      callBack
    )
  }
}
