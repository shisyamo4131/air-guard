import { logger } from 'firebase-functions/v2'
import {
  createIndex,
  removeIndex,
  syncToFirestoreFromAirGuard,
} from '../modules/database.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/Outsourcer.js'

/**
 * Cloud Functions で Firestore の Outsourcers ドキュメントを操作するためのクラスです。
 * FireMode を継承していますが、更新系のメソッドは利用できません。
 * @author shisyamo4131
 */
export default class Outsourcer extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Outsourcers'
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

  /****************************************************************************
   * Realtime Databaseの`AirGuard/Outsourcers`の内容で、FirestoreのOutsourcersドキュメントを更新します。
   * @param {string} code - Realtime Database内のOutsourcersデータを識別するコード
   * @returns {Promise<void>} - 同期が正常に完了した場合は、解決されたPromiseを返します
   ****************************************************************************/
  static async syncFromAirGuard(code) {
    try {
      await syncToFirestoreFromAirGuard(code, 'Outsourcers', this)
    } catch (err) {
      logger.error(err, { code })
      throw err
    }
  }
}

/**
 * Realtime Database で管理する Outsourcer インデックス用のクラスです。
 */
export class OutsourcerIndex extends Outsourcer {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    // インデックスに必要なプロパティを定義
    const keepProps = [
      'code',
      'name',
      'abbr',
      'abbrKana',
      'address1',
      'status',
      'sync',
    ]

    // Outsourcer クラスから不要なプロパティを削除
    Object.keys(this).forEach((key) => {
      if (!keepProps.includes(key)) delete this[key]
    })
  }

  /****************************************************************************
   * Realtime Database にインデックスを作成します。
   * @param {string} outsourcerId - インデックス作成対象の外注先ID
   ****************************************************************************/
  static async create(outsourcerId) {
    const functionName = 'create'
    try {
      await createIndex('Outsourcers', outsourcerId, this)
    } catch (error) {
      logger.error(`[${functionName}] ${error.message}`, { outsourcerId })
      throw error
    }
  }

  /****************************************************************************
   * Realtime Database からインデックスを削除します。
   * @param {string} outsourcerId - インデックス削除対象の外注先ID
   ****************************************************************************/
  static async remove(outsourcerId) {
    const functionName = 'remove'
    try {
      await removeIndex('Outsourcers', outsourcerId)
    } catch (error) {
      logger.error(`[${functionName}] ${error.message}`, { outsourcerId })
      throw error
    }
  }
}
