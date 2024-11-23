/**
 * ### SiteOperationSchedule.js
 *
 * #### 概要
 * 現場の稼働予定を管理するためのモデルクラスです。
 *
 * #### 機能詳細:
 * - 同一日、同一勤務区分でのドキュメントは作成できません。（keyにはsiteIdを含みますが、サブコレクションなので日付と勤務区分でのValidationです）
 *
 * #### 注意事項:
 * - ドキュメントのkeyとなるsiteId、date、workShiftは変更できないようにすべきです。
 *   -> Cloud Functions側も含めてsiteId、date、workShiftの変更時にエラーが出ないようにはしていますが、
 *      特にdate、workShiftです。これらが変更されるとCloud Functionsで稼働予定を作り直していますが、
 *      更新履歴が「削除」と「作成」になってしまいます。
 *      また、削除の更新履歴には削除理由を持たせることができません。
 *      稼働予定の「削除」は誤って作成してしまったときなどに行い、キャンセルによって稼働がなくなった場合は
 *      0人で更新すべきです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-09-16 - 初版作成
 */

import { runTransaction } from 'firebase/firestore'
import { FireModel, firestore } from 'air-firebase'
import { classProps } from './propsDefinition/SiteOperationSchedule'

export default class SiteOperationSchedule extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'SiteOperationSchedules'
  static classProps = classProps

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
  }

  /****************************************************************************
   * beforeCreateをオーバーライドします。
   * - 同一の現場、日付、勤務区分での稼働予定が存在する場合は作成不可です。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeCreate() {
    if (!this.siteId) {
      throw new Error('現場の指定が必要です。')
    }
    if (!this.date) {
      throw new Error('日付の指定が必要です。')
    }
    if (!this.workShift) {
      throw new Error('勤務区分の指定が必要です。')
    }
    if (this.isClosed) this.requiredWorkers = 0
    try {
      const id = `${this.siteId}-${this.date}-${this.workShift}`
      const existingSchedule = await this.fetchDoc(id)
      if (existingSchedule) {
        throw new Error('同一の稼働予定が既に登録されています。')
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
   * - 現場、日付、勤務区分が変更されていないか確認します。
   * @returns {Promise<void>} - 成功すると解決されるPromise
   * @throws {Error} - 現場、日付、勤務区分が変更されている場合にエラーをスローします。
   ****************************************************************************/
  async beforeUpdate() {
    // 正規表現を使用して、siteId, date, workShiftを抽出
    const match = this.docId.match(/^([^-]+)-(\d{4}-\d{2}-\d{2})-([^-]+)$/)
    const [, siteId, date, workShift] = match

    if (
      siteId !== this.siteId ||
      date !== this.date ||
      workShift !== this.workShift
    ) {
      throw new Error('現場、日付、勤務区分は変更できません。')
    }

    if (this.isClosed) this.requiredWorkers = 0

    // 親クラスの beforeUpdate メソッドを呼び出す
    await super.beforeUpdate()
  }

  /****************************************************************************
   * createメソッドをオーバーライドします。
   * - ドキュメントの作成時は、`dates`プロパティに格納されているすべての日付について一括で作成します。
   * - `docId`は`${siteId}-${date}-${workShift}`に固定されます。
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
          const docId = `${this.siteId}-${date}-${this.workShift}`
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
