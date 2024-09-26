import { error } from 'firebase-functions/logger'
import { getFirestore } from 'firebase-admin/firestore'
import FireModel from './FireModel'
import { classProps } from './propsDefinition/OperationResult'
import Site from './Site'
import OperationResultWorker from './OperationResultWorker'
import SiteContract from './SiteContract'
const firestore = getFirestore()
/**
 * ## OperationResults ドキュメントデータモデル【物理削除】
 *
 * 稼働実績のデータモデルです。
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
    delete this.create
    delete this.update
    delete this.delete
    Object.defineProperties(this, {
      /**
       * `workers` に保存されているオブジェクトから `employeeId` のみを抽出したものです。
       */
      employeeIds: {
        enumerable: true,
        configurable: true,
        get() {
          return this.workers.map(({ employeeId }) => employeeId)
        },
        set(v) {},
      },
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

  /**
   * 指定された従業員IDと現場IDに基づき、従業員が該当現場で稼働した初回日および最終日のデータを取得します。
   * - 対象のドキュメントが存在しない場合は `null` を返します。
   * - 最終日のドキュメントが存在しない場合、初回日のデータを最終日として扱います。
   *
   * @param {string} employeeId - 従業員を一意に識別するID
   * @param {string} siteId - 現場を一意に識別するID
   * @param {Object} transaction - Firestore のトランザクションオブジェクト
   * @returns {Object|null} - 従業員の初回日と最終日のデータ。データがない場合は `null` を返します。
   * @property {string} firstDate - 初回稼働日の日時
   * @property {string} firstOperationResultId - 初回稼働日に関連するOperationResultドキュメントID
   * @property {string} lastDate - 最終稼働日の日時
   * @property {string} lastOperationResultId - 最終稼働日に関連するOperationResultドキュメントID
   * @throws {Error} - データの取得中にエラーが発生した場合にスローされます。
   */
  async getFirstAndLastEmployeeDate(employeeId, siteId, transaction) {
    try {
      const colRef = firestore.collection(this.constructor.collectionPath)
      const baseQuery = colRef
        .where('siteId', '==', siteId)
        .where('employeeIds', 'array-contains', employeeId)

      // 最初の日付を取得
      const firstQuery = baseQuery.orderBy('date').limit(1)
      const firstQuerySnapshot = await transaction.get(firstQuery)

      if (firstQuerySnapshot.empty) {
        return null // データがない場合はnullを返す
      }

      const firstDoc = firstQuerySnapshot.docs[0]
      const { date: firstDate, docId: firstOperationResultId } = firstDoc.data()

      // 最後の日付を取得
      const lastQuery = baseQuery.orderBy('date', 'desc').limit(1)
      const lastQuerySnapshot = await transaction.get(lastQuery)

      let lastDate, lastOperationResultId
      if (lastQuerySnapshot.empty) {
        // 最後のドキュメントが存在しない場合、最初のデータを使う
        lastDate = firstDate
        lastOperationResultId = firstOperationResultId
      } else {
        const lastDoc = lastQuerySnapshot.docs[0]
        ;({ date: lastDate, docId: lastOperationResultId } = lastDoc.data())
      }

      return {
        firstDate,
        firstOperationResultId,
        lastDate,
        lastOperationResultId,
      }
    } catch (err) {
      error('Error fetching first and last employee date:', err)
      throw new Error(
        "Failed to fetch employee's first and last operation dates."
      )
    }
  }
}
