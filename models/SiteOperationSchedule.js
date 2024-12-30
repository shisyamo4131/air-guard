import { runTransaction } from 'firebase/firestore'
import { FireModel, firestore } from 'air-firebase'
import { classProps } from './propsDefinition/SiteOperationSchedule'

/**
 * 現場の稼働予定を管理するためのモデルクラスです。
 * @author shisyamo4131
 */
export default class SiteOperationSchedule extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'SiteOperationSchedules'
  static classProps = classProps

  /****************************************************************************
   * beforeCreateをオーバーライドします。
   * - 同一の現場、日付、勤務区分での稼働予定が存在する場合は作成不可です。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  beforeCreate() {
    return new Promise((resolve, reject) => {
      if (!this.siteId) {
        reject(new Error('現場の指定が必要です。'))
      }
      if (!this.date) {
        reject(new Error('日付の指定が必要です。'))
      }
      if (!this.workShift) {
        reject(new Error('勤務区分の指定が必要です。'))
      }
      if (this.isClosed) this.requiredWorkers = 0
      resolve()
    })
  }

  /****************************************************************************
   * beforeUpdateをオーバーライドします。
   * - 現場、日付、勤務区分が変更されていないか確認します。
   * @returns {Promise<void>} - 成功すると解決されるPromise
   * @throws {Error} - 現場、日付、勤務区分が変更されている場合にエラーをスローします。
   ****************************************************************************/
  beforeUpdate() {
    return new Promise((resolve, reject) => {
      // 正規表現を使用して、siteId, date, workShiftを抽出
      const match = this.docId.match(/^([^-]+)-(\d{4}-\d{2}-\d{2})-([^-]+)$/)
      const [, siteId, date, workShift] = match

      if (
        siteId !== this.siteId ||
        date !== this.date ||
        workShift !== this.workShift
      ) {
        reject(new Error('現場、日付、勤務区分は変更できません。'))
      }

      if (this.isClosed) this.requiredWorkers = 0
      resolve()
    })
  }

  /****************************************************************************
   * createメソッドをオーバーライドします。
   * - `docId`は`${siteId}-${date}-${workShift}`に固定されます。
   * - bulk オプションが true の場合は `dates` プロパティに保存されているすべての日付について一括で作成します。（既定値: true）
   * - bulk オプションが false の場合は親クラスのcreateメソッドを呼び出します。
   * @param {Object} options
   * @param {boolean} [options.bulk=true] - true の場合、複数のドキュメントを一括作成します。
   * @param {Object} [options.transaction=null] - Firestore のトランザクションオブジェクト（オプション）
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   * @throws {Error} ドキュメント作成中にエラーが発生した場合にエラーをスローします
   ****************************************************************************/
  async create({ bulk = true, transaction = null } = {}) {
    try {
      if (bulk) {
        await this._bulkCreate({ transaction })
      } else {
        // docId を固定
        const docId = `${this.siteId}-${this.date}-${this.workShift}`

        // ドキュメントが既に存在する場合はエラー
        const isExist = await this.fetchDoc(docId)
        if (isExist) {
          const message = `[create] 既に存在する現場稼働予定です。`
          throw new Error(message)
        }

        await super.create({ docId, transaction })
      }
    } catch (err) {
      const message = `[create] 現場稼働予定の作成処理でエラーが発生しました。: ${err.message}`
      // eslint-disable-next-line no-console
      console.error(message, { err })
      throw err
    }
  }

  /****************************************************************************
   * [PRIVATE]
   * dates プロパティを参照し、指定された複数（または単一）の日付の現場稼働予定ドキュメントを作成します。
   * @param {Object} options
   * @param {Object} [options.transaction=null] - Firestore のトランザクションオブジェクト（オプション）
   ****************************************************************************/
  async _bulkCreate({ transaction = null } = {}) {
    // 一括作成用である dates プロパティをチェック
    if (!Array.isArray(this.dates) || !this.dates.length) {
      throw new Error('[_bulkCreate] 日付が選択されていません。')
    }

    // 作成するドキュメントの ID を配列に用意
    const docIds = this.dates.map((date) => {
      return `${this.siteId}-${date}-${this.workShift}`
    })

    // 既に存在するドキュメントがある場合はエラー
    const existDocuments = await Promise.all(
      docIds.map((docId) => this.fetchDoc(docId))
    )
    if (existDocuments.some((doc) => doc)) {
      const message = `[_bulkCreate] 既に稼働予定が登録されている日付が含まれています。`
      throw new Error(message, { existDocuments })
    }

    // トランザクション処理を行う関数
    const transactionHandler = async (txn) => {
      for (const date of this.dates) {
        const docId = `${this.siteId}-${date}-${this.workShift}`
        this.date = date
        await super.create({ docId, txn })
      }
    }

    try {
      if (transaction) {
        await transactionHandler(transaction)
      } else {
        await runTransaction(firestore, transactionHandler)
      }
    } catch (err) {
      const message = `[_bulkCreate] 現場稼働予定の一括作成処理でエラーが発生しました。: ${err.message}`
      // eslint-disable-next-line no-console
      console.error(message, { err })
      throw err
    }
  }
}
