import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/Allowance.js'

/**
 * Cloud Functions で Firestore の Allowances ドキュメントを操作するためのクラスです。
 * FireMode を継承していますが、更新系のメソッドは利用できません。
 * @author shisyamo4131
 */
export default class Allowance extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Allowances'
  static classProps = classProps

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
}

/**
 * 他のドキュメントで不要なプロパティを排除した Allowance クラスです。
 */
export class AllowanceMinimal extends Allowance {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.tokenMap
    delete this.remarks
    delete this.createAt
    delete this.updateAt
    delete this.uid
  }
}
