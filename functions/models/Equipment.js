import { logger } from 'firebase-functions/v2'
import { createIndex, removeIndex } from '../modules/database.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/Equipment.js'

/**
 * Cloud Functions で Firestore の Equipments ドキュメントを操作するためのクラスです。
 * FireMode を継承していますが、更新系のメソッドは利用できません。
 * @author shisyamo4131
 */
export default class Equipment extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Equipments'
  static classProps = classProps

  /****************************************************************************
   * 更新系メソッドは使用不可
   ****************************************************************************/
  create() {
    return Promise.reject(new Error('このクラスの create は使用できません。'))
  }

  update() {
    return Promise.reject(new Error('このクラスの update は使用できません。'))
  }

  delete() {
    return Promise.reject(new Error('このクラスの delete は使用できません。'))
  }
}

/**
 * Realtime Database で管理する Equipment インデックス用のクラスです。
 */
export class EquipmentIndex extends Equipment {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    // インデックスに必要なプロパティを定義
    const keepProps = ['code', 'name', 'colorSize', 'status']

    // Equipment クラスから不要なプロパティを削除
    Object.keys(this).forEach((key) => {
      if (!keepProps.includes(key)) delete this[key]
    })
  }

  /****************************************************************************
   * Realtime Database にインデックスを作成します。
   * @param {string} equipmentId - インデックス作成対象の外注先ID
   ****************************************************************************/
  static async create(equipmentId) {
    const functionName = 'create'
    try {
      await createIndex('Equipments', equipmentId, this)
    } catch (error) {
      logger.error(`[${functionName}] ${error.message}`, { equipmentId })
      throw error
    }
  }

  /****************************************************************************
   * Realtime Database からインデックスを削除します。
   * @param {string} equipmentId - インデックス削除対象の外注先ID
   ****************************************************************************/
  static async remove(equipmentId) {
    const functionName = 'remove'
    try {
      await removeIndex('Equipments', equipmentId)
    } catch (error) {
      logger.error(`[${functionName}] ${error.message}`, { equipmentId })
      throw error
    }
  }
}
