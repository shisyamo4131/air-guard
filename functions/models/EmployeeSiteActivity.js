import FireModel from './FireModel'
import { classProps } from './propsDefinition/EmployeeSiteActivity'
/**
 * EmployeeSiteActivitiesドキュメントデータモデル【物理削除】
 *
 * - 従業員の現場初回入場日、最終入場日を管理するデータモデルです。
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-09-25 - 初版作成
 */
export default class EmployeeSiteActivity extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'EmployeeSiteActivities'
  static classProps = classProps
}
