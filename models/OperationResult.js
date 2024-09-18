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
 * @version 2.1.0
 * @author shisyamo4131
 * @updates
 * - version 2.2.0 - 2024-09-18 - `operationCount`プロパティを追加。
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
      operationCount: {
        configurable: true,
        enumerable: true,
        get() {
          return this.workers.length
        },
        set(v) {},
      },
    })
  }

  /****************************************************************************
   * FireModelのcreateをオーバーライドします。
   * - コレクションを自動採番対象として、createのuseAutonumberをtrueに固定します。
   * - `workers`配列の内容に応じて`OperationWorkResults`ドキュメントを同期生成します。
   * @param {string} docId - 作成するドキュメントのID。デフォルトはnull。
   * @param {boolean} useAutonumber - 自動採番を使用するかどうか。デフォルトはtrue。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   * @throws {Error} ドキュメントの作成に失敗した場合
   ****************************************************************************/
  async create({ docId = null, useAutonumber = true } = {}) {
    try {
      // トランザクションを使用してドキュメントの作成を管理
      await runTransaction(firestore, async (transaction) => {
        // 親ドキュメントの作成
        const docRef = await super.create({ docId, useAutonumber, transaction })

        // `workers`配列の各workerに対して、`OperationWorkResults`ドキュメントを生成
        for (const worker of this.workers) {
          // workerのデータと親ドキュメントのIDを使用してOperationWorkResultのインスタンスを生成
          const workResultInstance = new OperationWorkResult({
            ...worker,
            operationResultId: docRef.id, // 親ドキュメントのIDを関連付け
          })

          // トランザクションを使用して`OperationWorkResult`ドキュメントを作成
          await workResultInstance.create({ transaction })
        }
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
      // 現在登録されている`OperationWorkResults`ドキュメントをすべて取得
      const WorkResultInstance = new OperationWorkResult()
      const currentDocuments =
        await WorkResultInstance.fetchByOperationResultId(this.docId)

      // 取得したドキュメントから従業員IDを取得
      const currentEmployeeIds = currentDocuments.map(
        ({ employeeId }) => employeeId
      )

      // `workers`に存在しない従業員IDを取得（削除対象の従業員）
      const deleteEmployeeIds = currentEmployeeIds.filter((employeeId) => {
        return !this.workers.some((worker) => worker.employeeId === employeeId)
      })

      // トランザクションを使用して更新処理を実行
      await runTransaction(firestore, async (transaction) => {
        // 親クラスのupdateメソッドを呼び出し、自身を更新
        await super.update({ transaction })

        // `workers`配列に基づいて、`OperationWorkResults`ドキュメントを更新または作成
        for (const worker of this.workers) {
          const existDocument = currentDocuments.find(
            ({ employeeId }) => employeeId === worker.employeeId
          )

          // `currentDocuments`から既存のドキュメントを検索し、それにworkerのデータをマージ
          const workResultInstance = new OperationWorkResult({
            ...existDocument,
            ...worker,
            operationResultId: this.docId, // 親ドキュメントのIDを関連付け
          })

          // トランザクション内で`OperationWorkResult`ドキュメントを作成または更新
          if (existDocument) {
            await workResultInstance.update({ transaction })
          } else {
            await workResultInstance.create({ transaction })
          }
        }

        // `workers`に存在しない従業員に対応する`OperationWorkResults`ドキュメントを削除
        for (const employeeId of deleteEmployeeIds) {
          const workResultInstance = new OperationWorkResult({
            docId: `${this.docId}-${employeeId}`, // 削除対象のドキュメントIDを生成
          })
          await workResultInstance.delete({ transaction }) // 削除処理を実行
        }
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
   * FireModelのdeleteメソッドをオーバーライドします。
   * - 自身に依存するOperationWorkResultsドキュメントも同期削除します。
   * - トランザクションを使用して、全ての削除処理を一貫して行います。
   *
   * @returns {Promise<void>} 削除処理が完了すると解決されるPromise
   * @throws {Error} ドキュメント削除中にエラーが発生した場合にエラーをスローします
   ****************************************************************************/
  async delete() {
    try {
      // Firestoreトランザクションを使用して削除操作を実行
      await runTransaction(firestore, async (transaction) => {
        // 親クラスのdeleteメソッドを呼び出し、現在のドキュメントを削除
        await super.delete({ transaction })

        // 自身に依存する`workers`配列のOperationWorkResultsドキュメントも削除
        for (const worker of this.workers) {
          /**
           * 2024-09-10 トリッキーな処理
           * 本来であればfetchでインスタンスにデータを読み込んでからdeleteを削除するものを
           * 強引にdocIdをセットして削除している。
           */
          // OperationWorkResultsドキュメントを特定するためのIDを用意
          const docId = `${this.docId}-${worker.employeeId}`
          // 各workerに対応するOperationWorkResultインスタンスを作成し、削除を実行
          const workResultInstance = new OperationWorkResult({ docId })
          await workResultInstance.delete({ transaction }) // 非同期操作のためawaitを使用
        }
      })
    } catch (err) {
      // エラーハンドリング：エラーメッセージを出力し、エラーを再スロー
      // eslint-disable-next-line no-console
      console.error(`[delete] An error has occurred: ${err.message}`, { err })

      // 発生したエラーを再スローして、呼び出し元に通知
      throw err
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
        : worker || null
    })
    return {
      ...super.toObject(),
      site:
        this.site && typeof this.site.toObject === 'function'
          ? this.site.toObject()
          : this.site || null,
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
