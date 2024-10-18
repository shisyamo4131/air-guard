import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/OperationResult.js'
/**
 * ## OperationResult
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-18 - 初版作成
 */
export default class OperationResult extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'OperationResults'
  static classProps = classProps

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.create
    delete this.update
    delete this.delete
  }
}
