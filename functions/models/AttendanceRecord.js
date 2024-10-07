import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/AttendanceRecord.js'
import Employee from './Employee.js'

/**
 * AttendanceRecordsドキュメントデータモデル【論理削除】
 *
 * - 従業員の出勤簿に該当するドキュメントのデータモデルです。
 * - 当該ドキュメントは Cloud Functions によってすべて管理されます。（アプリ側では作成・更新・削除されません）
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
  }

  async daylySync({ employeeId, date }) {
    // employeeId、date が指定されていなければエラーをスロー
    // employeeId、date に該当する EmployeeContracts ドキュメントを取得
    // EmployeeContracts ドキュメントが取得できなければエラーをスロー
    // EmployeeContracts ドキュメントから
    // employeeId、date、に該当する OperationResults ドキュメントを取得（複数ドキュメントである可能性あり）
    /**
     * 所定内労働時間を計算
     * - OperationResults ドキュメントの workMinutes を合算
     * - EmployeeContract.workRegulation の scheduledWorkMinutes を最大値とする
     * ‐ 超過した分は一旦、所定外労働時間として控えておく
     */
  }
}
