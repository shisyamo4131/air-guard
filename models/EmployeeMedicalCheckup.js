import { FireModel } from 'air-firebase'
import Employee from './Employee'
import { classProps } from './propsDefinition/EmployeeMedicalCheckup'

/**
 * EmployeeMedicalCheckupsドキュメントデータモデル【物理削除】
 *
 * 従業員の健康診断情報を管理するためのデータモデルです。
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class EmployeeMedicalCheckup extends FireModel {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item, 'EmployeeMedicalCheckups', [], false, [], classProps)
  }

  /****************************************************************************
   * クラスインスタンスをオブジェクト形式に変換します。
   * - スーパークラスの `toObject` メソッドを呼び出し、その結果に `employee` プロパティを追加します。
   * - `employee` プロパティが存在し、かつ `toObject` メソッドを持つ場合、そのメソッドを呼び出してオブジェクトに変換します。
   * - `employee` が存在しない場合、もしくは `toObject` メソッドを持たない場合、そのままの値か、空のオブジェクトを返します。
   *
   * @returns {Object} - クラスインスタンスを表すオブジェクト
   ****************************************************************************/
  toObject() {
    return {
      ...super.toObject(),
      employee:
        this.employee && typeof this.employee.toObject === 'function'
          ? this.employee.toObject()
          : this.employee || null,
    }
  }

  /****************************************************************************
   * Firestoreから取得したデータをクラスインスタンスに変換します。
   * - スーパークラスの `fromFirestore` メソッドを呼び出して基本のインスタンスを取得します。
   * - 取得した `employee` データを新しい `Employee` クラスのインスタンスに変換します。
   * - `employee` が存在しない場合、`null` を引数として渡して `Employee` のインスタンスを作成します。
   *
   * @param {Object} snapshot - Firestoreから取得したドキュメントスナップショット
   * @returns {Object} - クラスインスタンス
   ****************************************************************************/
  fromFirestore(snapshot) {
    // スーパークラスから基本のインスタンスを生成
    const instance = super.fromFirestore(snapshot)

    // employee データを新しい Employee クラスのインスタンスに変換
    instance.employee = new Employee(instance?.employee || undefined)

    // 変換したインスタンスを返す
    return instance
  }

  /****************************************************************************
   * beforeCreateをオーバーライドします。
   * - `employeeId`、`date`の入力チェックを行います。
   * - `employeeId`と`date`が同一である他のドキュメントが存在した場合はエラーをスローします。
   * - `employeeId`に該当する`employee`オブジェクトを取得・セットします。
   * - validatePropertiesを行う為、super.beforeCreateを呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeCreate() {
    if (!this.employeeId) {
      throw new Error('従業員の指定が必要です。')
    }
    if (!this.date) {
      throw new Error('受診日の指定が必要です。')
    }
    const id = `${this.employeeId}-${this.date}`
    const existingContract = await this.fetchDoc(id)
    if (existingContract) {
      throw new Error('同一の受診履歴が既に登録されています。')
    }
    const employee = await new Employee().fetchDoc(this.employeeId)
    if (!employee) {
      throw new Error('従業員情報が取得できませんでした。')
    }
    this.employee = employee
    await super.beforeCreate()
  }

  /****************************************************************************
   * beforeUpdateをオーバーライドします。
   * - `employeeId`、`date`が変更されていないかをチェックします。
   * - validatePropertiesを行う為、super.beforeCreateを呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeUpdate() {
    const match = this.docId.match(/^(.+)-(\d{4}-\d{2}-\d{2})$/) // YYYY-MM-DD形式の日付部分をキャプチャ
    if (!match) {
      throw new Error('docIdの形式が正しくありません。')
    }

    const [, employeeId, date] = match // 分割した結果を格納
    if (employeeId !== this.employeeId || date !== this.date) {
      throw new Error('従業員、受診日は変更できません。')
    }
    await super.beforeUpdate()
  }

  /****************************************************************************
   * createをオーバーライドします。
   * - ドキュメントIDを`${employeeId}-${date}`に固定します。
   * - super.create({docId})を呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async create() {
    const docId = `${this.employeeId}-${this.date}`
    await super.create({ docId })
  }
}
