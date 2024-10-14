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

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

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
