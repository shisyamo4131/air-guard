import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/DailySale'
import OperationResultForDailySale from './OperationResultForDailySale'

/**
 * DailySalesドキュメントデータモデル
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-18 - 初版作成
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
    Object.defineProperties(this, {
      amount: {
        configurable: true,
        enumerable: true,
        get() {
          const result = { operationResults: 0 }
          result.operationResults = this.operationResults.reduce(
            (sum, i) => sum + i.sales.total,
            0
          )
        },
        set(v) {},
      },
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
}
