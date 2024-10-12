import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/MontlyAttendance'
import DailyAttendance from './DailyAttendance'

/**
 * ## MonthlyAttendancesドキュメントデータモデル【論理削除】
 *
 * @version 1.1.0
 * @author shisyamo4131
 * @updates
 * - version 1.1.0 - 2024-10-12 - customClassMap に DailyAttendance を設定
 * - version 1.0.0 - 2024-10-11 - 初版作成
 */
export default class MonthlyAttendance extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'MonthlyAttendances'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    dailyAttendances: DailyAttendance,
  }
}
