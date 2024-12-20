import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/EmployeeEmploymentInsurance'

/**
 * 従業員の雇用保険データモデル
 * - ドキュメントIDは `${従業員ID}-${資格取得日}` で固定です。
 *
 * @author shisyamo4131
 */
export default class EmployeeEmploymentInsurance extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'EmployeeEmploymentInsurances'
  static useAutonumber = false
  static classProps = classProps

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.tokenMap
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
