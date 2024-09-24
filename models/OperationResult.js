import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/OperationResult'
import Site from './Site'
import OperationResultWorker from './OperationResultWorker'
import SiteContract from './SiteContract'
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
 * @version 2.2.1
 * @author shisyamo4131
 * @updates
 * - version 2.2.1 - 2024-09-23 - `operationCount`プロパティの中身を細分化
 * - version 2.2.0 - 2024-09-18 - `operationCount`プロパティを追加。
 *                              - アプリ側から`site`オブジェクトがセットされる仕様に変更し、
 *                                `siteId`をObjectDefinePropertyによる`site`プロパティから取得するように修正。
 *                                結果、Firestoreのread件数を抑制。
 * - version 2.1.0 - 2024-09-07 - refreshClosingDate()を実装
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
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
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
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
          const result = this.workers.reduce(
            (sum, i) => {
              if (!i.qualification) {
                sum.standard[i.workResult] += 1
                sum.standard.total += 1
                sum.standard.overtimeMinutes += i.overtimeMinutes
              } else {
                sum.qualified[i.workResult] += 1
                sum.qualified.total += 1
                sum.qualified.overtimeMinutes += i.overtimeMinutes
              }
              sum.total += 1
              sum.overtimeMinutes += i.overtimeMinutes
              return sum
            },
            {
              standard: {
                normal: 0,
                half: 0,
                cancel: 0,
                total: 0,
                overtimeMinutes: 0,
              },
              qualified: {
                normal: 0,
                half: 0,
                cancel: 0,
                total: 0,
                overtimeMinutes: 0,
              },
              total: 0,
              overtimeMinutes: 0,
            }
          )

          return result
        },
        set(v) {},
      },
      siteId: {
        configurable: true,
        enumerable: true,
        get() {
          return this.site?.docId || ''
        },
        set(v) {},
      },
      siteContractId: {
        configurable: true,
        enumerable: true,
        get() {
          return this.siteContract?.docId || ''
        },
        set(v) {},
      },
      unitPrice: {
        configurable: true,
        enumerable: true,
        get() {
          // dayDivが設定されていない場合
          if (!this.dayDiv) return null

          // siteContractが設定されていない場合
          if (!this.siteContract?.docId) return null

          // unitPricesの取得に失敗した場合
          const unitPrices = this.siteContract?.unitPrices?.[this.dayDiv]
          if (!unitPrices) return null

          // 結果を構築して返す
          return {
            standard: {
              price: unitPrices.standard?.price ?? null,
              overtime: unitPrices.standard?.overtime ?? null,
            },
            qualified: {
              price: unitPrices.qualified?.price ?? null,
              overtime: unitPrices.qualified?.overtime ?? null,
            },
            halfRate: this.siteContract.halfRate,
            cancelRate: this.siteContract.cancelRate,
          }
        },
        set(v) {
          // 空のsetメソッドを残す (Vueのリアクティブシステムのために必要)
        },
      },
      sales: {
        configurable: true,
        enumerable: true,
        get() {
          const result = {
            standard: {
              normal: 0,
              half: 0,
              cancel: 0,
              total: 0,
              overtime: 0,
            },
            qualified: {
              normal: 0,
              half: 0,
              cancel: 0,
              total: 0,
              overtime: 0,
            },
            total: 0,
          }

          // unitPriceとoperationCountの存在をチェック
          if (!this.unitPrice || !this.operationCount) return result

          // スタンダード料金の計算
          result.standard.normal =
            (this.operationCount.standard?.normal || 0) *
            (this.unitPrice.standard?.price || 0)
          result.standard.half =
            ((this.operationCount.standard?.half || 0) *
              (this.unitPrice.standard?.price || 0) *
              (this.unitPrice.halfRate || 0)) /
            100
          result.standard.cancel =
            ((this.operationCount.standard?.cancel || 0) *
              (this.unitPrice.standard?.price || 0) *
              (this.unitPrice.cancelRate || 0)) /
            100
          result.standard.overtime =
            ((this.operationCount.standard?.overtimeMinutes || 0) / 60) *
            (this.unitPrice.standard?.overtime || 0)

          // 有資格者料金の計算
          result.qualified.normal =
            (this.operationCount.qualified?.normal || 0) *
            (this.unitPrice.qualified?.price || 0)
          result.qualified.half =
            ((this.operationCount.qualified?.half || 0) *
              (this.unitPrice.qualified?.price || 0) *
              (this.unitPrice.halfRate || 0)) /
            100
          result.qualified.cancel =
            ((this.operationCount.qualified?.cancel || 0) *
              (this.unitPrice.qualified?.price || 0) *
              (this.unitPrice.cancelRate || 0)) /
            100
          result.qualified.overtime =
            ((this.operationCount.qualified?.overtimeMinutes || 0) / 60) *
            (this.unitPrice.qualified?.overtime || 0)

          // 合計を計算
          result.standard.total =
            result.standard.normal +
            result.standard.half +
            result.standard.cancel +
            result.standard.overtime
          result.qualified.total =
            result.qualified.normal +
            result.qualified.half +
            result.qualified.cancel +
            result.qualified.overtime

          result.total = result.standard.total + result.qualified.total

          return result
        },
        set(v) {},
      },
    })
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
   * workers配列内のオブジェクトのdateプロパティを一括変更するメソッド
   * @param {string|null} [date=null] - 設定する日付。nullの場合はthis.dateを使用
   * @returns {void}
   ****************************************************************************/
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
