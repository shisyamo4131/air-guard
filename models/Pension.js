import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/Pension'
import { EmployeeMinimal } from './Employee'

/**
 * 従業員の厚生年金データモデル
 * - ドキュメントIDは `${従業員ID}-${資格取得日}` で固定です。
 *
 * @author shisyamo4131
 */
export default class Pension extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Pensions'
  static useAutonumber = false
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
   * - 従業員オブジェクトを employee プロパティにセットします。
   ****************************************************************************/
  async beforeCreate() {
    await this.employee.fetch(this.employeeId)
  }

  /****************************************************************************
   * beforeUpdate をオーバーライドします。
   * - 従業員IDに変更があった場合はエラーをスローします。
   ****************************************************************************/
  beforeUpdate() {
    return new Promise((resolve, reject) => {
      if (this.employeeId !== this.employee?.docId || null) {
        reject(new Error(`従業員IDは変更できません。`))
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
    const docId = `${this.employeeId}-${this.acquisitionDate}`
    return await super.create({ docId, transaction }, callBack)
  }
}
