import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/LeaveRecord.js'
/**
 * Cloud Functions で Firestore の LeaveRecords ドキュメントを操作するためのクラスです。
 * FireMode を継承していますが、更新系のメソッドは利用できません。
 * @author shisyamo4131
 */
export default class LeaveRecord extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'LeaveRecords'
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
 * LeaveRecord クラスからカスタムクラス用に不要なプロパティを削除したクラスです。
 */
export class LeaveRecordMinimal extends LeaveRecord {
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
