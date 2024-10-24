import { logger } from 'firebase-functions/v2'
import { getFirestore } from 'firebase-admin/firestore'
import { dateIsValid } from '../modules/utils.js'
import FireModel from './FireModel.js'
import OperationResultForSiteBilling from './OperationResultForSiteBilling.js'
import { accessor, classProps } from './propsDefinition/SiteBilling.js'
import OperationResult from './OperationResult.js'
const firestore = getFirestore()
const BATCH_LIMIT = 500

/**
 * SiteBillingsドキュメントデータモデル
 *
 * @author shisyamo4131
 */
export default class SiteBilling extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'SiteBillings'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    operationResults: OperationResultForSiteBilling,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.tokenMap // tokenMap は不要
  }

  /****************************************************************************
   * INITIALIZE
   ****************************************************************************/
  initialize(item = {}) {
    super.initialize(item)

    Object.defineProperties(this, {
      amount: accessor.amount,
      consumptionTax: accessor.consumptionTax,
      consumptionTaxs: accessor.consumptionTaxs,
      month: accessor.month,
      year: accessor.year,
    })
  }

  /****************************************************************************
   * createをオーバーライドします。
   * - ドキュメントIDを`${date}`に固定します。
   * - super.create({docId})を呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async create() {
    const docId = `${this.siteId}-${this.closingDate}`
    return await super.create({ docId })
  }

  /****************************************************************************
   * 指定された期間の SiteBilling ドキュメントを作成します。
   * - 指定された from から to の期間に該当する OperationResults ドキュメントを取得し、
   *   各日付ごとに SiteBilling ドキュメントを作成します。
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
      if (!dateIsValid(from) || !dateIsValid(to)) {
        const message = `[createInRange] from, to は 'YYYY-MM-DD' 形式で、妥当な日付である必要があります。`
        logger.error(message, { from, to })
        throw new Error(message)
      }

      try {
        // 既存ドキュメントを削除
        const existQueryRef = firestore
          .collection('SiteBillings')
          .where('closingDate', '>=', from)
          .where('closingDate', '<=', to)
        const existQuerySnapshot = await existQueryRef.get()
        const batchArray = []
        existQuerySnapshot.docs.forEach((doc, index) => {
          if (index % BATCH_LIMIT === 0) batchArray.push(firestore.batch())
          batchArray[batchArray.length - 1].delete(doc.ref)
        })
        await Promise.all(batchArray.map((batch) => batch.commit()))

        // closingDate を基準に OperationResults ドキュメントを取得
        const operationResultInstance = new OperationResult()
        const operationResultsAll = await operationResultInstance.fetchDocs([
          ['where', 'closingDate', '>=', from],
          ['where', 'closingDate', '<=', to],
        ])

        // siteId, closingDate の組み合わせをオブジェクト形式で作成（重複なし）
        const docIds = [
          ...new Set(
            operationResultsAll.map(({ siteId, closingDate }) =>
              JSON.stringify({ siteId, closingDate })
            )
          ),
        ].map((docId) => JSON.parse(docId))

        const promises = []
        for (const docId of docIds) {
          const { siteId, closingDate } = docId
          const operationResults = operationResultsAll.filter(
            (result) =>
              result.siteId === siteId && result.closingDate === closingDate
          )
          const customerId = operationResults[0].site.customer.docId
          const instance = new this({
            docId,
            customerId,
            siteId,
            closingDate,
            operationResults,
          })
          promises.push(instance.create())
        }
        await Promise.all(promises)
      } catch (error) {
        const message = `[createInRange] SiteBilling ドキュメントの作成中にエラーが発生しました。`
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
