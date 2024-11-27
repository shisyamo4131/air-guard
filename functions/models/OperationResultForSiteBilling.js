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

    delete this.tokenMap

    delete this.site
    delete this.workers
    delete this.outsourcers
    delete this.employeeIds
    delete this.outsourcerIds
    delete this.remarks
    delete this.siteContract
    delete this.siteContractId
  }

  /****************************************************************************
   * 更新系メソッドは使用不可
   ****************************************************************************/
  create() {
    return Promise.reject(new Error('このクラスの create は使用できません。'))
  }

  update() {
    return Promise.reject(new Error('このクラスの update は使用できません。'))
  }

  delete() {
    return Promise.reject(new Error('このクラスの delete は使用できません。'))
  }

  /****************************************************************************
   * INITIALIZE
   ****************************************************************************/
  initialize(item = {}) {
    super.initialize(item)

    this.securityType = item?.securityType || item?.site?.securityType || ''
    this.customerId = item?.customerId || item?.site?.customer?.docId || ''
    this.isInternal =
      item?.isInternal || item?.site?.customer?.isInternal || false
  }
}
