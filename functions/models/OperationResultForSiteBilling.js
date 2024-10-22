import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/OperationResult.js'

/**
 * ## OperationResultForSiteBilling
 *
 * SiteBilling クラス専用の OperationResult クラスです。
 *
 * @author shisyamo4131
 */
export default class OperationResultForSiteBilling extends FireModel {
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

    delete this.tokenMap
  }

  /****************************************************************************
   * INITIALIZE
   ****************************************************************************/
  initialize(item = {}) {
    super.initialize(item)

    delete this.site
    delete this.workers
    delete this.outsourcers
    delete this.employeeIds
    delete this.outsourcerIds
    delete this.remarks
    delete this.siteContract
    delete this.siteContractId

    this.securityType = item?.securityType || item?.site?.securityType || ''
    this.customerId = item?.customerId || item?.site?.customer?.docId || ''
  }
}
