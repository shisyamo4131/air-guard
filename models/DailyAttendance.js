import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/DailyAttendance'

/**
 * ## DailyAttendance
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-12 - 初版作成
 */
export default class DailyAttendance extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'DailyAttendances'
  static classProps = classProps
}
