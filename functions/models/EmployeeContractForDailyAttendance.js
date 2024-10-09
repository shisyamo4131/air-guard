import EmployeeContract from './EmployeeContract.js'
import WorkRegulationForDailyAttendance from './WorkRegulationForDailyAttendance.js'

/**
 * ## EmployeeContractForDailyAttendance
 *
 * DailyAttendance クラス専用の EmployeeContract クラスです。
 *
 * - EmployeeContract クラスから、DailyAttendance クラスに必要なプロパティのみを抽出したクラスです。
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-09 - 初版作成
 */
export default class EmployeeContractForDailyAttendance extends EmployeeContract {
  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    workRegulation: WorkRegulationForDailyAttendance,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.employee
    delete this.remarks
  }
}
