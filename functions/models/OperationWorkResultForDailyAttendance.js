import OperationWorkResult from './OperationWorkResult.js'

/**
 * ## OperationWorkResultForDailyAttendance
 *
 * DailyAttendance クラス専用の OperationWorkResult クラスです。
 *
 * - OperationWorkResult クラスから、DailyAttendance クラスに必要なプロパティのみを抽出したクラスです。
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-11 - 初版作成
 */
export default class OperationWorkResultForDailyAttendance extends OperationWorkResult {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.remarks
    delete this.tokenMap
  }
}
