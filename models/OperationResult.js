import { runTransaction, where } from 'firebase/firestore'
import { FireModel, firestore } from 'air-firebase'
import { classProps } from './propsDefinition/OperationResult'
import Site from './Site'
import OperationResultWorker from './OperationResultWorker'
import OperationWorkResult from './OperationWorkResult'
import { getClosingDate, isValidDateFormat } from '~/utils/utility'
/**
 * ## OperationResults ドキュメントデータモデル【物理削除】
 *
 * 稼働実績のデータモデルです。
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.1.0 - 2024-09-07 - refreshClosingDate()を実装
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class OperationResult extends FireModel {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item, 'OperationResults', [], false, [], classProps)
    Object.defineProperties(this, {
      month: {
        enumerable: true,
        configurable: true,
        get() {
          if (!this.date) return ''
          return this.date.slice(0, 7)
        },
        set(v) {},
      },
    })
  }

  /****************************************************************************
   * FireModelのcreateをオーバーライドします。
   * - コレクションを自動採番対象として、createのuseAutonumberをtrueに固定します。
   * - `workers`配列の内容に応じて`OperationWorkResults`ドキュメントを同期生成します。
   * @param {string} docId - 作成するドキュメントのID
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   * @throws {Error} ドキュメントの作成に失敗した場合
   ****************************************************************************/
  async create(docId = null) {
    try {
      await runTransaction(firestore, async (transaction) => {
        // 親ドキュメントの作成
        await super.create({ docId, useAutonumber: true })
        // `workers`配列に基づいて`OperationWorkResults`ドキュメントを作成
        for (const worker of this.workers) {
          const workResultInstance = new OperationWorkResult(worker)
          await workResultInstance.create({ transaction })
        }
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('ドキュメントの作成に失敗しました:', error)
      throw new Error('ドキュメントの作成中にエラーが発生しました。')
    }
  }

  /****************************************************************************
   * FireModelのbeforeCreateをオーバーライドします。
   * - `siteId`、`date`、`dayDiv`、`workShift`の入力を確認します。
   * - `site`を取得・セットします。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeCreate() {
    if (!this.siteId || !this.date || !this.dayDiv || !this.workShift) {
      throw new Error('現場、日付、曜日区分、勤務区分の指定が必要です。')
    }
    const site = await new Site().fetchDoc(this.siteId)
    if (!site) {
      throw new Error('現場情報が取得できませんでした。')
    }
    this.site = site
    await super.beforeCreate()
  }

  /****************************************************************************
   * FireModelのbeforeUpdateをオーバーライドします。
   * - `siteId`、`date`、`dayDiv`、`workShift`の入力を確認します。
   * - `site`を取得・セットします。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeUpdate() {
    if (!this.siteId || !this.date || !this.dayDiv || !this.workShift) {
      throw new Error('現場、日付、曜日区分、勤務区分の指定が必要です。')
    }
    if (this.siteId !== this.site.docId) {
      const site = await new Site().fetchDoc(this.siteId)
      if (!site) {
        throw new Error('現場情報が取得できませんでした。')
      }
      this.site = site
    }
    await super.beforeUpdate()
  }

  /****************************************************************************
   * クラスインスタンスをオブジェクト形式に変換します。
   * - `site`プロパティの値をtoObject()でオブジェクトに変換します。
   * - `workers`内の`worker`をtoObject()でオブジェクトに変換します。
   * - スーパークラスの `toObject` と結合した値を返します。
   * @returns {Object} - クラスインスタンスを表すオブジェクト
   ****************************************************************************/
  toObject() {
    const workers = this.workers.map((worker) => {
      return typeof worker.toObject === 'function'
        ? worker.toObject()
        : worker || {}
    })
    return {
      ...super.toObject(),
      site:
        this.site && typeof this.site.toObject === 'function'
          ? this.site.toObject()
          : this.site || {},
      workers,
    }
  }

  /****************************************************************************
   * Firestoreから取得したデータをクラスインスタンスに変換します。
   * - `site`を`Site`クラスのインスタンスに変換します。
   * - `workers`内の`worker`を`Worker`クラスのインスタンスに変換します。
   * @param {Object} snapshot - Firestoreから取得したドキュメントスナップショット
   * @returns {Object} - クラスインスタンス
   ****************************************************************************/
  fromFirestore(snapshot) {
    // スーパークラスから基本のインスタンスを生成
    const instance = super.fromFirestore(snapshot)
    // site データを新しい Site クラスのインスタンスに変換
    instance.site = new Site(instance.site)
    instance.workers = instance.workers.map((worker) => {
      return new OperationResultWorker(worker)
    })
    // 変換したインスタンスを返す
    return instance
  }

  /****************************************************************************
   * 指定されたcodeに該当するドキュメントデータを配列で返します。
   * @param {string} code - コード
   * @returns {Promise<Array>} - ドキュメントデータの配列
   * @throws {Error} - エラーが発生した場合にスローされます
   ****************************************************************************/
  async fetchByCode(code) {
    if (!code) throw new Error('Code is required.')
    try {
      const constraints = [where('code', '==', code)]
      const snapshots = await this.fetchDocs(constraints)
      return snapshots
    } catch (err) {
      const message = `[OperationResult.js fetchByCode] Error fetching documents for code ${code}: ${err.message}`
      // eslint-disable-next-line no-console
      console.error(message)
      throw new Error(message)
    }
  }

  /****************************************************************************
   * codeの配列を受け取り、該当するドキュメントデータを配列で返します。
   * codeの配列は、重複があれば一意に整理されます。
   * @param {Array<string>} codes - コードの配列
   * @returns {Promise<Array>} - ドキュメントデータの配列
   * @throws {Error} - 処理中にエラーが発生した場合にスローされます
   ****************************************************************************/
  async fetchByCodes(codes) {
    if (!Array.isArray(codes) || codes.length === 0) return []
    try {
      const unique = [...new Set(codes)]
      const chunked = unique.flatMap((_, i) =>
        i % 30 ? [] : [unique.slice(i, i + 30)]
      )
      const promises = chunked.map(async (arr) => {
        const constraints = [where('code', 'in', arr)]
        return await this.fetchDocs(constraints)
      })
      const snapshots = await Promise.all(promises)
      return snapshots.flat()
    } catch (err) {
      const message = `[OperationResult.js fetchByCodes] Error fetching documents: ${err.message}`
      // eslint-disable-next-line no-console
      console.error(message)
      throw new Error(message)
    }
  }

  /****************************************************************************
   * workersに従業員の稼働実績を追加します。
   * @param {Object} item 従業員の稼働実績オブジェクト
   ****************************************************************************/
  addWorker(item) {
    const worker = new OperationResultWorker(item)
    if (!worker.employeeId) {
      throw new Error('従業員IDが指定されていません。')
    }
    const isExist = this.workers.some(
      ({ employeeId }) => employeeId === worker.employeeId
    )
    if (isExist) {
      throw new Error('既に登録されている従業員です。')
    }
    if (!worker.isValid) {
      throw new Error('勤務実績としての妥当性が損なわれています。')
    }
    this.workers.push(worker)
  }

  /****************************************************************************
   * workersの指定された稼働実績を更新します。
   * @param {Object} item 従業員の稼働実績オブジェクト
   ****************************************************************************/
  changeWorker(item) {
    const worker = new OperationResultWorker(item)
    const index = this.workers.findIndex(
      (worker) => worker.employeeId === item.employeeId
    )
    if (index !== -1) {
      this.workers.splice(index, 1, worker)
    }
  }

  /****************************************************************************
   * workersから指定された従業員の稼働実績を削除します。
   * @param {Object} item 従業員の稼働実績オブジェクト
   ****************************************************************************/
  removeWorker(item) {
    const index = this.workers.findIndex(
      (worker) => worker.employeeId === item.employeeId
    )
    if (index !== -1) {
      this.workers.splice(index, 1)
    }
  }

  /**
   * 締日を更新する非同期メソッド
   * @returns {void}
   */
  async refreshClosingDate() {
    // siteIdが設定されているか確認
    if (!this.siteId) {
      // eslint-disable-next-line no-console
      console.warn('siteId is required to refresh closing date.')
      return // siteIdがない場合は処理を終了
    }

    // 日付が正しい形式かどうかを確認
    if (!this.date || !isValidDateFormat(this.date)) {
      // eslint-disable-next-line no-console
      console.warn(
        'A correctly formatted date is required to refresh closing date.'
      )
      return // 日付が無効な場合は処理を終了
    }

    try {
      // Siteインスタンスを生成し、siteIdに基づいてデータを取得
      const site = await new Site().fetchDoc(this.siteId)

      // siteオブジェクトからcustomer情報を取得し、締日を取得
      const deadline = site?.customer?.deadline

      if (!deadline) {
        // eslint-disable-next-line no-console
        console.warn('No deadline information found for the site.')
        return // 締日情報がない場合は処理を終了
      }

      // 日付と締日区分をもとに締日を計算してセット
      this.closingDate = getClosingDate(this.date, deadline)
    } catch (err) {
      // エラーハンドリング：サイトデータ取得や締日計算でエラーが発生した場合
      // eslint-disable-next-line no-console
      console.error('Error occurred while refreshing the closing date:', err)
    }
  }

  /**
   * workers配列内のオブジェクトのdateプロパティを一括変更するメソッド
   * @param {string|null} [date=null] - 設定する日付。nullの場合はthis.dateを使用
   * @returns {void}
   */
  refreshWorkersDate(date = null) {
    // dateが渡されなかった場合、this.dateを使用する
    const effectiveDate = date || this.date

    // 有効な日付フォーマットでない場合は警告を出して処理を終了する
    if (!isValidDateFormat(effectiveDate)) {
      // eslint-disable-next-line no-console
      console.warn(
        'Invalid date format. The date must be in YYYY-MM-DD format.'
      )
      return
    }

    // workers配列内の各workerオブジェクトのdateプロパティを更新
    this.workers.forEach((worker) => {
      worker.date = effectiveDate
    })
  }
}
