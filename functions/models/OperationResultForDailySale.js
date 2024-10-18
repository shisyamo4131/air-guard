import OperationResult from './OperationResult.js'
/**
 * ## OperationResultForDailySale
 *
 * DailySale クラス専用の OperationResult クラスです。
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-18 - 初版作成
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
}
