/**
 * 従業員支給手当データモデル
 * - EmployeeContract クラスで使用されます。
 * @author shisyamo4131
 */
export default class EmployeeAllowance {
  /***************************************************************************
   * CONSTRUCTOR
   ***************************************************************************/
  constructor(item = {}) {
    this.initialize(item)
  }

  initialize(item = {}) {
    this.docId = item.docId ?? ''
    this.amount = item.amount ?? 0
  }

  toObject() {
    return { ...this }
  }
}
