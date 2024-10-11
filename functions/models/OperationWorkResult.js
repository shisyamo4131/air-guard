import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/OperationResultWorker.js'
import { classProps as addProps } from './propsDefinition/OperationWorkResult.js'

/**
 * ## OperationWorkResults
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-11 - 初版作成
 */
export default class OperationWorkResult extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'OperationWorkResults'
  static classProps = { ...classProps, ...addProps }

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
