import { FireModel, firestore } from 'air-firebase'
import { doc } from 'firebase/firestore'
import {
  accessor,
  classProps,
  customClassMap,
} from './propsDefinition/OperationResult'
import OperationResultWorker from './OperationResultWorker'
import { SiteContractMinimal } from './SiteContract'
import OperationWorkResult from './OperationWorkResult'
import OperationResultOutsourcer from './OperationResultOutsourcer'
import { getClosingDate, isValidDateFormat } from '~/utils/utility'

/**
 * 稼働実績ドキュメントデータモデル
 *
 * - 従業員稼働実績（OperationWorkResults）ドキュメントが同期的に作成・更新されます。
 *   -> 削除に対する同期は Cloud Functions 側で行っています。
 *   -> 更新に対する同期はアプリ側のみです。
 *
 * - ドキュメントの作成時のみ、現場取極め情報が自動的に適用されます。
 *   該当するものが存在しない場合、適用されません。
 *   適用する現場取極め情報を指定・変更するのは稼働請求管理で行うべきであり、
 *   ドキュメントの更新時にまで適用する現場取極め情報を更新してしまうと、
 *   稼働請求管理で別途指定した取極め情報を上書きしてしまうからです。
 *   但し、現場ID、勤務区分が変更されていた場合はドキュメントの変更時に再度適用を行います。
 *
 * @author shisyamo4131
 * @refact 2025-01-25
 */
export default class OperationResult extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'OperationResults'
  static useAutonumber = true
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = customClassMap

  /****************************************************************************
   * INITIALIZE
   ****************************************************************************/
  initialize(item = {}) {
    super.initialize(item)
    Object.defineProperties(this, {
      employeeIds: accessor.employeeIds,
      outsourcerIds: accessor.outsourcerIds,
      month: accessor.month,
      operationCount: accessor.operationCount,
      siteContractId: accessor.siteContractId,
      unitPrice: accessor.unitPrice,
      sales: accessor.sales,
      consumptionTax: accessor.consumptionTax,
    })
  }

  /****************************************************************************
   * beforeCreate をオーバーライドします。
   * - 現場IDから現場ドキュメントを取得して自身の site プロパティにセットします。
   * - 取引先情報から締日を計算してセットします。
   ****************************************************************************/
  async beforeCreate() {
    // 現場情報を取得して自身に反映
    await this.site.fetch(this.siteId).catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`[beforeCreate] 現場情報の取得に失敗しました。`)
      throw err
    })

    // 締日を現場情報が保有する取引先情報から取得してセット
    try {
      this.refreshClosingDate()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[beforeCreate] 締日の設定に失敗しました。`)
      throw err
    }

    // 現場取極め情報を自身にセット（存在しなくてもエラーにはしない）
    await this.siteContract
      .loadContract({
        siteId: this.siteId,
        date: this.date,
        workShift: this.workShift,
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(
          `[beforeCreate] 現場取極め情報の取得時にエラーが発生しました。`
        )
        throw err
      })
  }

  /****************************************************************************
   * beforeUpdate をオーバーライドします。
   * - 現場IDが変更されている場合は現場情報と締日を更新します。
   ****************************************************************************/
  async beforeUpdate() {
    // 現場IDが変更されていれば現場情報、締日を更新
    if (this.siteId !== this.site?.docId) {
      await this.site.fetch(this.siteId).catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`[beforeUpdate] 現場情報の取得に失敗しました。`)
        throw err
      })

      // 締日を現場情報が保有する取引先情報から取得してセット
      try {
        this.refreshClosingDate()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[beforeUpdate] 締日の設定に失敗しました。`)
        throw err
      }
    }

    /**
     * - 現場 ID が変更された
     * - 読み込まれている現場取極め情報の勤務区分と自身の勤務区分が異なる
     * 上記2点のいずれかの条件に合致する場合、現場取極め情報を再度読み込む
     */
    if (
      this.siteId !== this.site.docId ||
      (this.siteContractId && this.workShift !== this.siteContract.workShift)
    ) {
      // 現場取極め情報を自身にセット（存在しなくてもエラーにはしない）
      await this.siteContract
        .loadContract({
          siteId: this.siteId,
          date: this.date,
          workShift: this.workShift,
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error(
            `[beforeCreate] 現場取極め情報の取得時にエラーが発生しました。`
          )
          throw err
        })
    }
  }

  /****************************************************************************
   * FireModelのcreateをオーバーライドします。
   * - コレクションを自動採番対象として、createのuseAutonumberをtrueに固定します。
   * - `workers`配列の内容に応じて`OperationWorkResults`ドキュメントを同期生成します。
   * @param {Object} [options={}] - オプション引数
   * @param {boolean} [options.useAutonumber=true] - 自動採番を行うかどうかです。`#useAutonumber` が優先されます。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   * @throws {Error} ドキュメントの作成に失敗した場合
   ****************************************************************************/
  async create({ useAutonumber = true } = {}) {
    try {
      await super.create({ useAutonumber }, (transaction, doc) => {
        // workers 配列の中身をすべて OperationWorkResult ドキュメントとして作成
        this.workers.forEach((worker) => {
          const workResultInstance = new OperationWorkResult({
            ...worker,
            operationResultId: doc.docId, // 親ドキュメントのIDを関連付け
            siteId: doc.siteId,
          })
          workResultInstance.create({ transaction })
        })
      })
    } catch (err) {
      // エラー時にエラーメッセージを出力 (ESLintの警告を無効化)
      // eslint-disable-next-line no-console
      console.error(`[create] An error has occurred: ${err.message}`, { err })

      // エラーをスローして、呼び出し元にエラーが発生したことを通知
      throw err
    }
  }

  /****************************************************************************
   * FireModelのupdateメソッドをオーバーライドします。
   * - `OperationWorkResults`ドキュメントを`workers`に基づいて更新します。
   * - `workers`に存在しない従業員IDに対応するドキュメントを削除します。
   * - トランザクションを使用して、一貫した更新処理を保証します。
   *
   * @returns {Promise<void>} 更新処理が完了すると解決されるPromise
   * @throws {Error} 更新処理中にエラーが発生した場合にエラーをスローします
   ****************************************************************************/
  async update() {
    try {
      await super.update({}, async (transaction) => {
        // 現在登録されている`OperationWorkResults`ドキュメントをすべて取得
        const WorkResultInstance = new OperationWorkResult()
        const currentDocuments = await WorkResultInstance.fetchDocs([
          ['where', 'operationResultId', '==', this.docId],
        ])

        // 現在の workers に存在しない従業員の OperationWorkResult ドキュメントを削除
        currentDocuments
          .filter(({ employeeId }) => {
            return !this.workers.some(
              (worker) => worker.employeeId === employeeId
            )
          })
          .forEach((currentDoc) => {
            const docId = `${this.docId}-${currentDoc.employeeId}`
            const docRef = doc(firestore, 'OperationWorkResults', docId)
            transaction.delete(docRef)
          })

        // 既存ドキュメントの内容を保持しつつ workers 配列の要素分のドキュメントを作成
        this.workers.forEach((worker) => {
          const existDocument = currentDocuments.find(({ employeeId }) => {
            return employeeId === worker.employeeId
          })
          const workResultInstance = new OperationWorkResult({
            ...existDocument,
            ...worker,
            operationResultId: this.docId, // 親ドキュメントのIDを関連付け
            siteId: this.siteId,
          })
          if (existDocument) {
            workResultInstance.update({ transaction })
          } else {
            workResultInstance.create({ transaction })
          }
        })
      })
    } catch (err) {
      // エラーハンドリング：エラーメッセージを出力し、エラーを再スロー
      // eslint-disable-next-line no-console
      console.error(`[update] An error has occurred: ${err.message}`, { err })

      // エラーを再スローして、呼び出し元に通知
      throw err
    }
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
      const constraints = [['where', 'code', '==', code]]
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
        const constraints = [['where', 'code', 'in', arr]]
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
    const worker = new OperationResultWorker({
      ...item,
      date: item.date || this.date,
    })
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

  /****************************************************************************
   * outsourcerに外注先の稼働実績を追加します。
   * @param {Object} item 外注先の稼働実績オブジェクト
   ****************************************************************************/
  addOutsourcer(item) {
    const outsourcer = new OperationResultOutsourcer({
      ...item,
      date: item.date || this.date,
    })
    if (!outsourcer.outsourcerId) {
      throw new Error('外注先IDが指定されていません。')
    }
    if (!outsourcer.isValid) {
      throw new Error('勤務実績としての妥当性が損なわれています。')
    }
    outsourcer.branch = this.outsourcers.length
    this.outsourcers.push(outsourcer)
  }

  /****************************************************************************
   * outsourcerの指定された稼働実績を更新します。
   * @param {Object} item 外注先の稼働実績オブジェクト
   ****************************************************************************/
  changeOutsourcer(item) {
    const outsourcer = new OperationResultOutsourcer(item)
    const index = this.outsourcers.findIndex(({ id }) => id === item.id)
    if (index !== -1) {
      this.outsourcers.splice(index, 1, outsourcer)
    }
  }

  /****************************************************************************
   * outsourcerから指定された従業員の稼働実績を削除します。
   * @param {Object} item 従業員の稼働実績オブジェクト
   ****************************************************************************/
  removeOutsourcer(item) {
    const index = this.outsourcers.findIndex(({ id }) => id === item.id)
    if (index !== -1) {
      this.outsourcers.splice(index, 1)
    }
    // `branch` を振りなおす
    this.outsourcers.forEach((outsourcer, index) => {
      outsourcer.branch = index
    })
  }

  /****************************************************************************
   * `date`と`site`に応じて締日を計算して更新します。
   * - siteが設定されていない、または`date`が無効な場合は処理を中断します。
   * @returns {void}
   * @updates
   * - 2024-09-18 - `site`プロパティがアプリからセットされる仕様変更に伴って修正。
   ****************************************************************************/
  refreshClosingDate() {
    // siteが設定されているか確認
    if (!this.site) {
      // eslint-disable-next-line no-console
      console.warn(
        '[refreshClosingDate]: site is required to refresh the closing date.'
      )
      return // siteがない場合は処理を終了
    }

    // 日付が正しい形式かどうかを確認
    if (!this.date || !isValidDateFormat(this.date)) {
      // eslint-disable-next-line no-console
      console.warn(
        '[refreshClosingDate]: A correctly formatted date is required to refresh the closing date.'
      )
      return // 日付が無効な場合は処理を終了
    }

    try {
      // siteオブジェクトからcustomer情報を取得し、締日を取得
      const deadline = this.site?.customer?.deadline

      if (!deadline) {
        // eslint-disable-next-line no-console
        console.warn(
          '[refreshClosingDate]: No deadline information found for the site.'
        )
        return // 締日情報がない場合は処理を終了
      }

      // 日付と締日区分をもとに締日を計算してセット
      this.closingDate = getClosingDate(this.date, deadline)
    } catch (err) {
      // エラーハンドリング：サイトデータ取得や締日計算でエラーが発生した場合
      // eslint-disable-next-line no-console
      console.error(
        '[refreshClosingDate]: Error occurred while refreshing the closing date:',
        err
      )
    }
  }

  /****************************************************************************
   * `workers` および `outsourcers` 配列内のオブジェクトのdateプロパティを一括変更するメソッド
   * @param {string|null} [date=null] - 設定する日付。nullの場合はthis.dateを使用
   * @returns {void}
   ****************************************************************************/
  refreshDetailsDate(date = null) {
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

    // outsourcers配列内の各workerオブジェクトのdateプロパティを更新
    this.outsourcers.forEach((outsourcer) => {
      outsourcer.date = effectiveDate
    })
  }

  /****************************************************************************
   * [2025-01-14 GInputOperationResult(旧)を削除したら削除可能]
   * 適用される契約情報を現在設定されている現場、日付、勤務区分で更新します。
   * - 現場（site）、日付（date）、勤務区分（workShift）がすべて設定されている場合にのみ契約情報を取得します。
   * - siteContractプロパティが契約情報で更新されます。
   * - 必要な情報が不足している場合、警告を出力し、処理を中断します。
   * - 条件に該当する契約情報が存在しない、またはエラーが発生した場合、契約情報はnullになります。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise。エラーが発生した場合はログに出力されます。
   ****************************************************************************/
  async refreshContract() {
    // siteContractをリセット
    this.siteContract = null

    const { site, date, workShift } = this

    // site、date、workShiftが揃っているかを確認
    if (!site || !date || !workShift) {
      // eslint-disable-next-line no-console
      console.warn('[refreshContract] Missing required data:', {
        site: !!site,
        date: !!date,
        workShift: !!workShift,
      })
      return
    }

    const params = { siteId: site.docId, date, workShift }

    try {
      const contract = new SiteContractMinimal()

      // 契約情報のロード
      await contract.loadContract(params)

      // 契約情報が存在する場合のみ適用
      this.siteContract = contract.docId ? contract : null

      if (!this.siteContract) {
        // eslint-disable-next-line no-console
        console.warn('[refreshContract] No contract found for:', params)
      }
    } catch (err) {
      // エラーハンドリング：契約情報の読み込み中にエラーが発生した場合
      // eslint-disable-next-line no-console
      console.error('[refreshContract] Failed to load SiteContract:', err)
    }
  }
}
