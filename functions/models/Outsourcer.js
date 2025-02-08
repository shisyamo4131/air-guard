/*****************************************************************************
 * カスタムクラス定義: 外注先 - Outsourcer -
 *
 * @author shisyamo4131
 * @refact 2025-02-08
 *****************************************************************************/
import { logger } from 'firebase-functions/v2'
import {
  createIndex,
  removeIndex,
  syncToFirestoreFromAirGuard,
} from '../modules/database.js'
import FireModel from './FireModel.js'
import { generateProps } from './propsDefinition/propsUtil.js'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 外注先code
  code: { type: String, default: '', required: false },

  // 外注先名
  name: { type: String, default: '', required: false, requiredByClass: true },

  // 外注先略称
  abbr: { type: String, default: '', required: false, requiredByClass: true },

  // 外注先略称カナ
  abbrKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 郵便番号
  zipcode: { type: String, default: '', required: false },

  // 住所
  address1: { type: String, default: '', required: false },

  // 建物名・階数
  address2: { type: String, default: '', required: false },

  // 電話番号
  tel: { type: String, default: '', required: false },

  // FAX番号
  fax: { type: String, default: '', required: false },

  // 状態
  status: {
    type: String,
    default: 'active',
    required: false,
    requiredByClass: true,
  },

  // 備考
  remarks: { type: String, default: '', required: false },

  // 同期状態
  sync: { type: Boolean, default: false, required: false },
}

const { classProps } = generateProps(propsDefinition)

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class Outsourcer extends FireModel {
  // FireModel 設定
  static collectionPath = 'Outsourcers'
  static useAutonumber = true
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['abbr', 'abbrKana']
  static hasMany = [
    {
      collection: 'OperationResults',
      field: 'outsourcerIds',
      condition: 'array-contains',
      type: 'collection',
    },
  ]

  /**
   * Realtime Databaseの`AirGuard/Outsourcers`の内容で、FirestoreのOutsourcersドキュメントを更新します。
   * @param {string} code - Realtime Database内のOutsourcersデータを識別するコード
   * @returns {Promise<void>} - 同期が正常に完了した場合は、解決されたPromiseを返します
   */
  static async syncFromAirGuard(code) {
    try {
      await syncToFirestoreFromAirGuard(code, 'Outsourcers', this)
    } catch (err) {
      logger.error(err, { code })
      throw err
    }
  }
}

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class OutsourcerMinimal extends Outsourcer {
  // initialize をオーバーライド
  initialize(item = {}) {
    super.initialize(item)
    delete this.createAt
    delete this.updateAt
    delete this.uid
    delete this.remarks
    delete this.tokenMap
  }

  // 更新系メソッドは使用不可
  create() {
    return Promise.reject(new Error('このクラスの create は使用できません。'))
  }

  update() {
    return Promise.reject(new Error('このクラスの update は使用できません。'))
  }

  delete() {
    return Promise.reject(new Error('このクラスの delete は使用できません。'))
  }

  deleteAll() {
    return Promise.reject(
      new Error('このクラスの deleteAll は使用できません。')
    )
  }

  restore() {
    return Promise.reject(new Error('このクラスの restore は使用できません。'))
  }
}

/*****************************************************************************
 * カスタムクラス - Index -
 *****************************************************************************/
export class OutsourcerIndex extends OutsourcerMinimal {
  // インデックスとして用意するプロパティを定義
  static keepProps = [
    'code',
    'name',
    'abbr',
    'abbrKana',
    'address1',
    'status',
    'sync',
  ]

  // initialize をオーバーライド
  initialize(item = {}) {
    super.initialize(item)

    // keepProps で定義されたプロパティ以外を削除
    Object.keys(this).forEach((key) => {
      if (!this.constructor.keepProps.includes(key)) delete this[key]
    })
  }

  /**
   * Realtime Database にインデックスを作成します。
   * @param {string} outsourcerId - インデックス作成対象の外注先ID
   */
  static async create(outsourcerId) {
    const functionName = 'create'
    try {
      await createIndex('Outsourcers', outsourcerId, this)
    } catch (error) {
      logger.error(`[${functionName}] ${error.message}`, { outsourcerId })
      throw error
    }
  }

  /**
   * Realtime Database からインデックスを削除します。
   * @param {string} outsourcerId - インデックス削除対象の外注先ID
   */
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
