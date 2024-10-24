import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js'
import { logger } from 'firebase-functions/v2'
import FireModel from './FireModel.js'
import OperationResultForDailySale from './OperationResultForDailySale.js'
import { accessor, classProps } from './propsDefinition/DailySale.js'
dayjs.extend(isSameOrBefore)

/**
 * ## DailySaleドキュメントデータモデル
 *
 * @author shisyamo4131
 */
export default class DailySale extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'DailySales'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    operationResults: OperationResultForDailySale,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.tokenMap

    // Object.defineProperties(this, {
    //   month: {
    //     configurable: true,
    //     enumerable: true,
    //     get() {
    //       if (!this.date) return ''
    //       return this.date.slice(0, 7)
    //     },
    //     set(v) {},
    //   },
    //   year: {
    //     configurable: true,
    //     enumerable: true,
    //     get() {
    //       if (!this.month) return
    //       return this.month.slice(0, 4)
    //     },
    //     set(v) {},
    //   },
    //   amount: {
    //     configurable: true,
    //     enumerable: true,
    //     get() {
    //       const result = { operationResults: 0 }
    //       result.operationResults = this.operationResults.reduce(
    //         (sum, i) => sum + i.sales.total,
    //         0
    //       )
    //       return result
    //     },
    //     set(v) {},
    //   },
    // })
  }

  /****************************************************************************
   * INITIALIZE
   ****************************************************************************/
  initialize(item = {}) {
    super.initialize(item)

    Object.defineProperties(this, {
      month: accessor.month,
      year: accessor.year,
      amount: accessor.amount,
      consumptionTax: accessor.consumptionTax,
    })
  }

  /****************************************************************************
   * createをオーバーライドします。
   * - ドキュメントIDを`${date}`に固定します。
   * - super.create({docId})を呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async create() {
    const docId = `${this.date}`
    return await super.create({ docId })
  }

  /****************************************************************************
   * 指定された期間の DailySale ドキュメントを作成します。
   * - 指定された from から to の期間に該当する OperationResults ドキュメントを取得し、
   *   各日付ごとに DailySale ドキュメントを作成します。
   * - from, to は 'YYYY-MM-DD' 形式の文字列であり、妥当な日付である必要があります。
   *
   * @param {Object} param0 - 入力パラメータ。
   * @param {string} param0.from - 取得するデータの開始日（'YYYY-MM-DD' 形式）。
   * @param {string} param0.to - 取得するデータの終了日（'YYYY-MM-DD' 形式）。
   * @throws {Error} 引数が不足している場合、または不正な日付形式の場合にエラーがスローされます。
   ****************************************************************************/
  static async createInRange({ from, to }) {
    try {
      // 引数のチェック
      if (!from || !to) {
        const message = `[createInRange] 必要な引数が指定されていません。`
        logger.error(message, { from, to })
        throw new Error(message)
      }

      // from, to は string であること
      if (typeof from !== 'string' || typeof to !== 'string') {
        const message = `[createInRange] from, to は string でなくてはなりません。`
        logger.error(message, { from, to })
        throw new TypeError(message)
      }

      // from, to が 'YYYY-MM-DD' 形式で、妥当な日付であるかをチェック
      const regexDate = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
      if (
        !regexDate.test(from) ||
        !regexDate.test(to) ||
        !dayjs(from, 'YYYY-MM-DD', true).isValid() ||
        !dayjs(to, 'YYYY-MM-DD', true).isValid()
      ) {
        const message = `[createInRange] from, to は 'YYYY-MM-DD' 形式で、妥当な日付である必要があります。`
        logger.error(message, { from, to })
        throw new Error(message)
      }

      // OperationResults ドキュメントを取得
      let operationResults = []
      try {
        const operationResultInstance = new OperationResultForDailySale()
        operationResults = await operationResultInstance.fetchDocs([
          ['where', 'date', '>=', from],
          ['where', 'date', '<=', to],
        ])
      } catch (error) {
        const message = `[createInRange] OperationResults の取得中にエラーが発生しました。`
        logger.error(message, { from, to, error })
        throw new Error(message)
      }

      // 日付範囲を日ごとの配列に分割
      const startDate = dayjs(from)
      const endDate = dayjs(to)
      const daysDifference = endDate.diff(startDate, 'day')
      const days = Array.from({ length: daysDifference + 1 }, (_, i) =>
        startDate.add(i, 'day').format('YYYY-MM-DD')
      )

      // 各日付の DailySale ドキュメントを作成
      try {
        const promises = days.map((date) => {
          const instance = new this()
          instance.operationResults = operationResults.filter(
            (result) => result.date === date
          )
          instance.date = date
          return instance.create()
        })
        await Promise.all(promises)
      } catch (error) {
        const message = `[createInRange] DailySale ドキュメントの作成中にエラーが発生しました。`
        logger.error(message, { from, to, error })
        throw new Error(message)
      }
    } catch (error) {
      const message = `[createInRange] 処理中にエラーが発生しました。`
      logger.error(message, { from, to, error })
      throw new Error(message)
    }
  }
}
