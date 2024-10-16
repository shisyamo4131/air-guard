import FireModel from './FireModel.js'
import LeaveRecord from './LeaveRecord.js'
import OperationWorkResultForDailyAttendance from './OperationWorkResultForDailyAttendance.js'
import { classProps } from './propsDefinition/DailyAttendance.js'

/**
 * ## DailyAttendanceForMonthlyAttendance
 *
 * MonthlyAttendance クラス専用の DailyAttendance クラスです。
 *
 * - DailyAttendance クラスから、MonthlyAttendance クラスに必要なプロパティのみを抽出したクラスです。
 * - 勤務時間などのプロパティが Object.defineProperty で計算されてしまうため、DailyAttendance クラスを
 *   継承するのではなく、FireModel 継承し、propsDefinition.DailyAttendance でプロパティ定義をしています。
 *
 * @version 1.1.0
 * @author shisyamo4131
 * @updates
 * - version 1.1.0 - 2024-10-16 - leaveRecord プロパティを追加し、customClassMap を更新
 * - version 1.0.0 - 2024-10-11 - 初版作成
 */
export default class DailyAttendanceForMonthlyAttendance extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'DailyAttendances'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    operationWorkResults: OperationWorkResultForDailyAttendance,
    leaveRecord: LeaveRecord,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.employeeContracts
  }
}
