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

    delete this.create
    delete this.update
    delete this.delete

    delete this.tokenMap
  }
}
