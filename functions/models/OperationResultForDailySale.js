import OperationResult from './OperationResult.js'

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

    const site = item?.site // item.siteを変数にまとめる
    const customer = site?.customer // site.customerを変数にまとめる

    this.securityType = item?.securityType || site?.securityType || ''
    this.customerId = item?.customerId || customer?.docId || ''
    this.isInternal = customer?.isInternal ?? false // ?? を使ってundefinedとnullを明確に区別
  }
}
