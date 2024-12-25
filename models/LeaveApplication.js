/**
 * 従業員休暇申請データモデル
 * @author shisyamo4131
 */

import { runTransaction } from 'firebase/firestore'
import { FireModel, firestore } from 'air-firebase'
import { accessor, classProps } from './propsDefinition/LeaveApplication'

export default class LeaveApplication extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'LeaveApplications'
  static classProps = classProps

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    Object.defineProperties(this, {
      month: accessor.month,
    })
  }

  /****************************************************************************
   * beforeCreateをオーバーライドします。
   * - 同一の従業員、日付での休暇申請が存在する場合は作成不可です。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeCreate() {
    if (!this.employeeId) {
      throw new Error('従業員の指定が必要です。')
    }
    if (!this.date) {
      throw new Error('日付の指定が必要です。')
    }
    try {
      const id = `${this.employeeId}-${this.date}`
      const existingSchedule = await this.fetchDoc(id)
      if (existingSchedule) {
        throw new Error('同一日付の休暇申請が既に登録されています。')
      }
      await super.beforeCreate()
    } catch (err) {
      // eslint-disable-next-line
      console.error(`[beforeCreate] An error has occured: ${err.message}`)
      throw err
    }
  }

  /****************************************************************************
   * beforeUpdateをオーバーライドします。
   * - 従業員、日付が変更されていないか確認します。
   * @returns {Promise<void>} - 成功すると解決されるPromise
   * @throws {Error} - 従業員、日付が変更されている場合にエラーをスローします。
   ****************************************************************************/
  async beforeUpdate() {
    // 正規表現を使用して、employeeId, dateを抽出
    const match = this.docId.match(/^([^-]+)-(\d{4}-\d{2}-\d{2})$/)
    const [, employeeId, date] = match

    if (employeeId !== this.employeeId || date !== this.date) {
      throw new Error('従業員、日付は変更できません。')
    }

    await super.beforeUpdate()
  }

  /****************************************************************************
   * createメソッドをオーバーライドします。
   * - ドキュメントの作成時は、`dates`プロパティに格納されているすべての日付について一括で作成します。
   * - `docId`は`${employeeId}-${date}`に固定されます。
   * - 生成した`docId`を使用して親クラスのcreateメソッドを呼び出します。
   * - 親クラスのcreateメソッドのtransactionオプションを利用して、`dates`に指定された日数分のドキュメントを作成します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   * @throws {Error} ドキュメント作成中にエラーが発生した場合にエラーをスローします
   ****************************************************************************/
  async create() {
    if (!this.dates.length) {
      throw new Error('[create] 日付が選択されていません。')
    }
    try {
      await runTransaction(firestore, async (transaction) => {
        for (const date of this.dates) {
          const docId = `${this.employeeId}-${date}`
          this.date = date
          await super.create({ docId, transaction })
        }
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[create] Failed to create document: ${err.message}`, {
        err,
      })
      throw err
    }
  }
}
