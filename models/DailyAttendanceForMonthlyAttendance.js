import { FireModel } from 'air-firebase'
import LeaveRecord from './LeaveRecord'
import { classProps } from './propsDefinition/DailyAttendance'
import OperationWorkResultForDailyAttendance from './OperationWorkResultForDailyAttendance'

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
 * - version 1.0.0 - 2024-10-17 - 初版作成
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
    Object.defineProperties(this, {
      scheduledWorkingHours: {
        configurable: true,
        enumerable: true,
        get() {
          return this.scheduledWorkingMinutes / 60
        },
        set(v) {},
      },
      breakHours: {
        configurable: true,
        enumerable: true,
        get() {
          return this.breakMinutes / 60
        },
        set(v) {},
      },
      nonStatutoryOvertimeHours: {
        configurable: true,
        enumerable: true,
        get() {
          return this.nonStatutoryOvertimeMinutes / 60
        },
        set(v) {},
      },
    })
  }
}
