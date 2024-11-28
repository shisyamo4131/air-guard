import {
  extractDiffsFromDocUpdatedEvent,
  syncDependentDocuments,
} from '../modules/utils.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/OperationResult.js'
import { SiteMinimal } from './Site.js'
import { SiteContractMinimal } from './SiteContract.js'

/**
 * Cloud Functions で Firestore の OperationResults ドキュメントを操作するためのクラスです。
 * FireMode を継承していますが、更新系のメソッドは利用できません。
 * @author shisyamo4131
 */
export default class OperationResult extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'OperationResults'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    site: SiteMinimal,
    siteContract: SiteContractMinimal,
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
   * OperationResults ドキュメントの site プロパティを更新します。
   * - 引数 event は Firestore の更新トリガーオブジェクトを受け取ります。
   * - event の before, after を比較し、更新が不要な場合は処理をスキップします。
   * @param {Object} event - Firestore の更新トリガーオブジェクト
   ****************************************************************************/
  static async refreshSite(event) {
    const isChanged = extractDiffsFromDocUpdatedEvent({
      event,
      ComparisonClass: OperationResult.customClassMap.site,
    })
    if (isChanged.length === 0) return
    await syncDependentDocuments(
      OperationResult.collectionPath,
      'site.docId',
      'site',
      isChanged.data
    )
  }
}

/**
 * OperationResult クラスからカスタムクラス用に不要なプロパティを削除したクラスです。
 */
export class OperationResultMinimal extends OperationResult {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.createAt
    delete this.updateAt
    delete this.remarks
    delete this.tokenMap
  }
}

/**
 * SiteBilling クラスの専用の OperationResult クラス です。
 */
export class OperationResultForSiteBilling extends OperationResultMinimal {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.site
    delete this.workers
    delete this.outsourcers
    delete this.employeeIds
    delete this.outsourcerIds
    delete this.siteContract
    delete this.siteContractId
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

/**
 * DailySale クラスの専用の OperationResult クラス です。
 */
export class OperationResultForDailySale extends OperationResultMinimal {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.site
    delete this.workers
    delete this.outsourcers
    delete this.employeeIds
    delete this.outsourcerIds
    delete this.siteContract
    delete this.siteContractId
  }

  /****************************************************************************
   * INITIALIZE
   ****************************************************************************/
  initialize(item = {}) {
    super.initialize(item)

    const site = item?.site // item.siteを変数にまとめる
    const customer = site?.customer // site.customerを変数にまとめる

    this.securityType = item?.securityType || site?.securityType || ''
    this.customerId = item?.customerId || customer?.docId || ''
    this.isInternal = customer?.isInternal ?? false // ?? を使ってundefinedとnullを明確に区別
  }
}
