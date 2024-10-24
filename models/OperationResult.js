import { FireModel, firestore } from 'air-firebase'
import { doc } from 'firebase/firestore'
import { accessor, classProps } from './propsDefinition/OperationResult'
import Site from './Site'
import OperationResultWorker from './OperationResultWorker'
import SiteContract from './SiteContract'
import OperationWorkResult from './OperationWorkResult'
import OperationResultOutsourcer from './OperationResultOutsourcer'
import { getClosingDate, isValidDateFormat } from '~/utils/utility'

/**
 * ## OperationResults ドキュメントデータモデル【物理削除】
 *
 * 稼働実績のデータモデルです。
 *
 * - `OperationWorkerResults`ドキュメントが同期的に作成・更新・削除されます。
 *   -> `OperationResults`ドキュメントがアプリ外から削除された場合に備えて
 *      Cloud Functionsでも同期削除の処理が必要です。
 *   -> 更新に対する同期はアプリ側のみで行います。
 *
 * @author shisyamo4131
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
  static customClassMap = {
    site: Site,
    siteContract: SiteContract,
    workers: OperationResultWorker,
    outsourcers: OperationResultOutsourcer,
  }

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
   * FireModelのdeleteメソッドはカスタマイズしません。
   * - OperationWorkResult ドキュメントは Cloud Functions で同期削除されます。
   ****************************************************************************/
  // async delete() {
  //   try {
  //     await super.delete({}, async (transaction) => {
  //       // 自身に依存する`workers`配列のOperationWorkResultsドキュメントも削除
  //       for (const worker of this.workers) {
  //         /**
  //          * 2024-09-10 トリッキーな処理
  //          * 本来であればfetchでインスタンスにデータを読み込んでからdeleteを削除するものを
  //          * 強引にdocIdをセットして削除している。
  //          */
  //         // OperationWorkResultsドキュメントを特定するためのIDを用意
  //         const docId = `${this.docId}-${worker.employeeId}`
  //         // 各workerに対応するOperationWorkResultインスタンスを作成し、削除を実行
  //         const workResultInstance = new OperationWorkResult({ docId })
  //         await workResultInstance.delete({ transaction }) // 非同期操作のためawaitを使用
  //       }
  //     })
  //   } catch (err) {
  //     // eslint-disable-next-line no-console
  //     console.error(`[delete] An error has occurred: ${err.message}`, { err })

  //     // 発生したエラーを再スローして、呼び出し元に通知
  //     throw err
  //   }
  // }

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

  /****************************************************************************
   * outsourcerに外注先の稼働実績を追加します。
   * @param {Object} item 外注先の稼働実績オブジェクト
   ****************************************************************************/
  addOutsourcer(item) {
    const outsourcer = new OperationResultOutsourcer(item)
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
      const contract = new SiteContract()

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
