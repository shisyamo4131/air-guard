import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/Allowance'

/**
 * 手当マスタデータモデル
 * @author shisyamo4131
 */
export default class Allowance extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Allowances'
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['name', 'nameKana']
  static hasMany = [
    {
      collection: 'EmployeeContracts',
      field: 'allowanceIds',
      condition: 'array-contains',
      type: 'collection',
    },
  ]
}

/**
 * Allowance クラスから createAt, updateAt, uid, remarks, tokenMap を削除したクラスです。
 * - 非正規化した allowance プロパティを持つドキュメントに保存するデータを提供するためのクラス
 * - 不要なプロパティを削除することでデータ量を抑制するために使用します。
 * - 更新系のメソッドは利用できません。
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
