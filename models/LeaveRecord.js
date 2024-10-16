import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/LeaveRecord'

/**
 * LeaveRecordsドキュメントデータモデル【物理削除】
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-16 - 初版作成
 */
export default class LeaveRecord extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'LeaveRecords'
  static classProps = classProps
}
