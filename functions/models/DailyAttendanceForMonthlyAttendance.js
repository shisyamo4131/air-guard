import FireModel from './FireModel.js'
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
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-11 - 初版作成
 */
export default class DailyAttendanceForMonthlyAttendance extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'DailyAttendances'
  static classProps = classProps

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.employeeContracts
    delete this.operationWorkResults
  }
}
