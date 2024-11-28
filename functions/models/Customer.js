import { logger } from 'firebase-functions/v2'
import {
  createIndex,
  removeIndex,
  syncToFirestoreFromAirGuard,
} from '../modules/database.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/Customer.js'

/**
 * Cloud Functions で Firestore の Customers ドキュメントを操作するためのクラスです。
 * FireMode を継承していますが、更新系のメソッドは利用できません。
 * @author shisyamo4131
 */
export default class Customer extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Customers'
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
   * Realtime Databaseの`AirGuard/Customers`の内容で、FirestoreのCustomersドキュメントを更新します。
   * @param {string} code - Realtime Database内のCustomersデータを識別するコード
   * @returns {Promise<void>} - 同期が正常に完了した場合は、解決されたPromiseを返します
   ****************************************************************************/
  static async syncFromAirGuard(code) {
    try {
      const converter = (item) => {
        return { ...item, depositMonth: parseInt(item.depositMonth) }
      }
      await syncToFirestoreFromAirGuard(code, 'Customers', this, converter)
    } catch (err) {
      logger.error(err, { code })
      throw err
    }
  }
}

/**
 * Realtime Database で管理する Customer インデックス用のクラスです。
 */
export class CustomerIndex extends Customer {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    // インデックスに必要なプロパティを定義
    const keepProps = [
      'code',
      'name1',
      'name2',
      'abbr',
      'abbrKana',
      'address1',
      'status',
      'sync',
      'inInternal',
    ]

    // Customer クラスから不要なプロパティを削除
    Object.keys(this).forEach((key) => {
      if (!keepProps.includes(key)) delete this[key]
    })
  }

  /****************************************************************************
   * Realtime Database にインデックスを作成します。
   * @param {string} customerId - インデックス作成対象の取引先ID
   ****************************************************************************/
  static async create(customerId) {
    const functionName = 'create'
    try {
      await createIndex('Customers', customerId, this)
    } catch (error) {
      logger.error(`[${functionName}] ${error.message}`, { customerId })
      throw error
    }
  }

  /****************************************************************************
   * Realtime Database からインデックスを削除します。
   * @param {string} customerId - インデックス削除対象の取引先ID
   ****************************************************************************/
  static async remove(customerId) {
    const functionName = 'remove'
    try {
      await removeIndex('Customers', customerId)
    } catch (error) {
      logger.error(`[${functionName}] ${error.message}`, { customerId })
      throw error
    }
  }
}

/**
 * Customer クラスからカスタムクラス用に不要なプロパティを削除したクラスです。
 */
export class CustomerMinimal extends Customer {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.createAt
    delete this.updateAt
    delete this.remarks
    delete this.tokenMap
  }
}
