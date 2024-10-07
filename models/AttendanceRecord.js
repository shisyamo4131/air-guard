import { FireModel } from 'air-firebase'
import Employee from './Employee'
import { classProps } from './propsDefinition/AttendanceRecord'

/**
 * AttendanceRecordsドキュメントデータモデル【物理削除】
 *
 * - 従業員の出勤簿に該当するドキュメントのデータモデルです。
 * - アプリ側からデータが作成・更新・削除されることは想定されていませんので、モデル側での入力チェックは行っていません。
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-07 - 初版作成
 */
export default class AttendanceRecord extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'AttendanceRecords'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    employee: Employee,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.create
    delete this.update
    delete this.delete
  }
}
