/*****************************************************************************
 * カスタムクラス定義: 取引先 - Customer -
 *
 * @author shisyamo4131
 * @refact 2025-02-06
 *****************************************************************************/
import { logger } from 'firebase-functions/v2'
import {
  createIndex,
  removeIndex,
  syncToFirestoreFromAirGuard,
} from '../modules/database.js'
import FireModel from './FireModel.js'
import { generateProps } from './propsDefinition/propsUtil.js'

/**
 * PROPERTIES
 */
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 取引先code
  code: { type: String, default: '', required: false },

  // 取引先名1
  name1: { type: String, default: '', required: false, requiredByClass: true },

  // 取引先名2
  name2: { type: String, default: '', required: false },

  // 取引先名略称
  abbr: { type: String, default: '', required: false, requiredByClass: true },

  // 取引先名略称カナ
  abbrKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 郵便番号
  zipcode: {
    type: String,
    default: '',
    required: false,
  },

  // 住所
  address1: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 建物名・階数
  address2: {
    type: String,
    default: '',
    required: false,
  },

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

  // 締日
  deadline: {
    type: String,
    default: '99',
    required: false,
    requiredByClass: true,
  },

  // 入金サイト（月）
  depositMonth: {
    type: Number,
    default: 1,
    validator: (v) => v > 0,
    required: false,
    requiredByClass: true,
  },

  // 入金サイト（日）
  depositDate: {
    type: String,
    default: '99',
    required: false,
    requiredByClass: true,
  },

  // 備考
  remarks: { type: String, default: '', required: false },

  // 同期状態
  sync: { type: Boolean, default: false, required: false },

  // 自社情報フラグ
  isInternal: { type: Boolean, default: false, required: false },
}

const { classProps } = generateProps(propsDefinition)

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class Customer extends FireModel {
  // FireModel 設定
  static collectionPath = 'Customers'
  static useAutonumber = true
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['abbr', 'abbrKana']
  static hasMany = [
    {
      collection: 'Sites',
      field: 'customerId',
      condition: '==',
      type: 'collection',
    },
  ]

  /**
   * Realtime Databaseの`AirGuard/Customers`の内容で、FirestoreのCustomersドキュメントを更新します。
   * @param {string} code - Realtime Database内のCustomersデータを識別するコード
   * @returns {Promise<void>} - 同期が正常に完了した場合は、解決されたPromiseを返します
   */
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

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class CustomerMinimal extends Customer {
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
export class CustomerIndex extends CustomerMinimal {
  // インデックスとして用意するプロパティを定義
  static keepProps = [
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
   * @param {string} customerId - インデックス作成対象の取引先ID
   */
  static async create(customerId) {
    const functionName = 'create'
    try {
      await createIndex('Customers', customerId, this)
    } catch (error) {
      logger.error(`[${functionName}] ${error.message}`, { customerId })
      throw error
    }
  }

  /**
   * Realtime Database からインデックスを削除します。
   * @param {string} customerId - インデックス削除対象の取引先ID
   */
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
