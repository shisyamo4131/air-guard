import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/Equipment'

/**
 * Equipmentsドキュメントデータモデル【論理削除】
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class Equipment extends FireModel {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(
      item,
      'Equipments',
      [
        {
          collection: 'EquipmentTransactions',
          field: 'equipmentId',
          condition: '==',
          type: 'collection',
        },
      ],
      true,
      ['name'],
      classProps
    )
    this.tokenFields = ['name']
  }
}
