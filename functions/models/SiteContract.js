import {
  extractDiffsFromDocUpdatedEvent,
  syncDependentDocuments,
} from '../modules/utils.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/SiteContract.js'
import { SiteMinimal } from './Site.js'

/**
 * Cloud Functions で Firestore の SiteContracts ドキュメントを操作するためのクラスです。
 * FireMode を継承していますが、更新系のメソッドは利用できません。
 * @author shisyamo4131
 */
export default class SiteContract extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'SiteContracts'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    site: SiteMinimal,
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
   * SiteContracts ドキュメントの site プロパティを更新します。
   * - 引数 event は Firestore の更新トリガーオブジェクトを受け取ります。
   * - event の before, after を比較し、更新が不要な場合は処理をスキップします。
   * @param {Object} event - Firestore の更新トリガーオブジェクト
   ****************************************************************************/
  static async refreshSite(event) {
    const isChanged = extractDiffsFromDocUpdatedEvent({
      event,
      ComparisonClass: SiteContract.customClassMap.site,
    })
    if (isChanged.length === 0) return
    await syncDependentDocuments(
      SiteContract.collectionPath,
      'site.docId',
      'site',
      isChanged.data
    )
  }
}

/**
 * Site クラスからカスタムクラス用に不要なプロパティを削除したクラスです。
 */
export class SiteContractMinimal extends SiteContract {
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
