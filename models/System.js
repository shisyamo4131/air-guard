import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/System'

/**
 * Systemsドキュメントデータモデル
 *
 * - システムの状態を表す Firestore ドキュメントのデータモデルです。
 * - アプリ側での操作を制限するため、CUD メソッドを削除しています。
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-15 - 初版作成
 */
export default class System extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Systems'
  static logicalDelete = true
  static classProps = classProps

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.create
    delete this.update
    delete this.delete
  }
}
