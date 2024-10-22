import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/SiteBilling'
import OperationResultForSiteBilling from './OperationResultForSiteBilling'

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

  constructor(item = {}) {
    super(item)

    delete this.create
    delete this.update
    delete this.delete
  }
}
