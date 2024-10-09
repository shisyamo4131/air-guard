import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js'
import WorkRegulation from './WorkRegulation.js'
dayjs.extend(isSameOrBefore)

/**
 * ## WorkRegulationForDailyAttendance
 *
 * DailyAttendance クラス専用の WorkRegulation クラスです。
 *
 * - WorkRegulation クラスから、DailyAttendance クラスに必要なプロパティのみを抽出したクラスです。
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-09 - 初版作成
 */
export default class WorkRegulationForDailyAttendance extends WorkRegulation {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.bonusEligibility
    delete this.name
    delete this.tokenMap
    delete this.remarks
  }
}
