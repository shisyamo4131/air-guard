/*****************************************************************************
 * カスタムクラス定義: 雇用保険 - EmploymentInsurance -
 *
 * @author shisyamo4131
 * @refact 2025-02-10
 *****************************************************************************/
import { FireModel } from 'air-firebase'
import { EmployeeMinimal } from './Employee'
import { generateProps } from './propsDefinition/propsUtil'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  /**
   * ドキュメントID
   * - `${従業員ID}-${資格取得日}`
   */
  docId: { type: String, default: '', required: false },

  // 従業員ID
  employeeId: {
    type: String,
    default: '',
    required: true,
    requiredByClass: true,
  },

  // 従業員
  employee: {
    type: Object,
    default: () => new EmployeeMinimal(),
    required: false,
  },

  // 資格取得日（YYYY-MM-DD）
  acquisitionDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 被保険者整理番号
  policyNumber: { type: String, default: '', required: false },

  // 資格喪失日（YYYY-MM-DD）
  lossDate: { type: String, default: '', required: false },

  // 備考
  remarks: { type: String, default: '', required: false },
}

const { vueProps, classProps } = generateProps(propsDefinition)
export { vueProps }

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class EmploymentInsurance extends FireModel {
  // FireModel 設定
  static collectionPath = 'EmploymentInsurances'
  static useAutonumber = false
  static logicalDelete = false
  static classProps = classProps
  static tokenFields = []
  static hasMany = []

  // カスタムクラスマップ
  static customClassMap = {
    employee: EmployeeMinimal,
  }

  // initialize をオーバーライドし、tokenMap を削除
  initialize(item = {}) {
    super.initialize(item)
    delete this.tokenMap
  }

  /**
   * beforeCreate をオーバーライドします。
   * - 従業員オブジェクトを employee プロパティにセットします。
   */
  async beforeCreate() {
    await this.employee.fetch(this.employeeId)
    await super.beforeCreate()
  }

  /**
   * beforeUpdate をオーバーライドします。
   * - 従業員IDに変更があった場合はエラーをスローします。
   */
  async beforeUpdate() {
    if (this.employeeId !== this._beforeData.employeeId) {
      throw new Error(`従業員IDは変更できません。`)
    }
    await super.beforeUpdate()
  }

  /**
   * create メソッドをオーバーライドします。
   * - ドキュメントIDを固定します。
   * @param {Object} [options={}] - オプション引数
   * @param {Object|null} [options.transaction=null] - Firestore のトランザクションオブジェクト。指定しない場合は自動トランザクションを使用します。
   * @param {function|null} [callBack=null] - 追加のトランザクション処理です。引数にトランザクションオブジェクトが渡されます。
   */
  async create({ transaction = null } = {}, callBack = null) {
    const docId = `${this.employeeId}-${this.acquisitionDate}`
    return await super.create({ docId, transaction }, callBack)
  }
}

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class EmploymentInsuranceMinimal extends EmploymentInsurance {
  // initialize をオーバーライド
  initialize(item = {}) {
    super.initialize(item)
    delete this.createAt
    delete this.updateAt
    delete this.uid
    delete this.remarks
    delete this.tokenMap
  }

  // 更新系メソッドは使用不可
  create() {
    return Promise.reject(new Error('このクラスの create は使用できません。'))
  }

  update() {
    return Promise.reject(new Error('このクラスの update は使用できません。'))
  }

  delete() {
    return Promise.reject(new Error('このクラスの delete は使用できません。'))
  }

  deleteAll() {
    return Promise.reject(
      new Error('このクラスの deleteAll は使用できません。')
    )
  }

  restore() {
    return Promise.reject(new Error('このクラスの restore は使用できません。'))
  }
}
