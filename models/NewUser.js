import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/User'

/**
 * NewUserドキュメントデータモデル【論理削除】
 *
 * @author shisyamo4131
 */
export default class NewUser extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'NewUsers'
  static logicalDelete = true
  static classProps = classProps

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.tokenMap // tokenMap は不要
  }
}
