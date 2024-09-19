import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/EquipmentTransaction'

/**
 * EquipmentTransactionsドキュメントデータモデル【物理削除】
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-09-04 - 初版作成
 */
export default class Equipment extends FireModel {
  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    equipment: Equipment,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item, 'EquipmentTransactions', [], false, ['name'], classProps)
  }

  /****************************************************************************
   * beforeCreateをオーバーライドします。
   * - `equipmentId`、`date`の入力チェックを行います。
   * - `equipmentId`と`date`が同一である他のドキュメントが存在した場合はエラーをスローします。
   * - `equipmentId`に該当する`equipment`オブジェクトを取得・セットします。
   * - validatePropertiesを行う為、super.beforeCreateを呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeCreate() {
    if (!this.equipmentId) {
      throw new Error('制服・装備品の指定が必要です。')
    }
    if (!this.date) {
      throw new Error('日付の指定が必要です。')
    }
    const id = `${this.equipmentId}-${this.date}`
    const existingContract = await this.fetchDoc(id)
    if (existingContract) {
      throw new Error('同一日の入出庫情報が既に登録されています。')
    }
    const equipment = await new Equipment().fetchDoc(this.equipmentId)
    if (!equipment) {
      throw new Error('制服・装備品情報が取得できませんでした。')
    }
    this.equipment = equipment
    await super.beforeCreate()
  }

  /****************************************************************************
   * beforeUpdateをオーバーライドします。
   * - `equipmentId`、`date`が変更されていないかをチェックします。
   * - validatePropertiesを行う為、super.beforeUpdateを呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeUpdate() {
    const match = this.docId.match(/^(.+)-(\d{4}-\d{2}-\d{2})$/) // YYYY-MM-DD形式の日付部分をキャプチャ
    if (!match) {
      throw new Error('docIdの形式が正しくありません。')
    }

    const [, equipmentId, date] = match // 分割した結果を格納
    if (equipmentId !== this.equipmentId || date !== this.date) {
      throw new Error('制服・装備品、日付は変更できません。')
    }
    await super.beforeUpdate()
  }

  /****************************************************************************
   * createをオーバーライドします。
   * - ドキュメントIDを`${equipmentId}-${date}`に固定します。
   * - super.create({docId})を呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async create() {
    const docId = `${this.equipmentId}-${this.date}`
    await super.create({ docId })
  }
}
