import OperationResult from './OperationResult'

/**
 * ## OperationResultForDailySale
 *
 * DailySale クラス専用の OperationResult クラスです。
 *
 * @author shisyamo4131
 */
export default class OperationResultForDailySale extends OperationResult {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.create
    delete this.update
    delete this.delete

    delete this.site
    delete this.workers
    delete this.outsourcers
    delete this.employeeIds
    delete this.outsourcerIds
    delete this.remarks
    delete this.siteContract
    delete this.siteContractId
  }

  initialize(item = {}) {
    super.initialize(item)

    this.securityType = item?.securityType || item?.site?.securityType || ''
    this.customerId = item?.customerId || item?.site?.customer?.docId || ''
  }
}
