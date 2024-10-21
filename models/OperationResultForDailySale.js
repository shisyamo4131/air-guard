import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/OperationResult'

/**
 * ## OperationResultForDailySale
 *
 * DailySale クラス専用の OperationResult クラスです。
 *
 * @author shisyamo4131
 */
export default class OperationResultForDailySale extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'OperationResults'
  static useAutonumber = true
  static classProps = classProps

  /****************************************************************************
   * INITIALIZE
   ****************************************************************************/
  initialize(item = {}) {
    super.initialize(item)

    // 読み取り専用クラスとして実装
    delete this.create
    delete this.update
    delete this.delete

    // 不要なプロパティを削除
    delete this.site
    delete this.workers
    delete this.outsourcers
    delete this.employeeIds
    delete this.outsourcerIds
    delete this.remarks
    delete this.siteContract
    delete this.siteContractId

    // 個別プロパティを定義
    this.securityType = item?.securityType || item?.site?.securityType || ''
    this.customerId = item?.customerId || item?.site?.customer?.docId || ''
  }
}
