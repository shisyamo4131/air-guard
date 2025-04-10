/*****************************************************************************
 * カスタムクラス定義: 現場 - Site -
 *
 * @author shisyamo4131
 * @refact 2025-02-06
 *****************************************************************************/
import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import {
  createIndex,
  removeIndex,
  syncToFirestoreFromAirGuard,
} from '../modules/database.js'
import { CustomerMinimal } from './Customer.js'
import FireModel from './FireModel.js'
import { generateProps } from './propsDefinition/propsUtil.js'
const firestore = getFirestore()

/**
 * PROPERTIES
 */
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 取引先ID
  customerId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 取引先ドキュメント
  customer: {
    type: Object,
    default: null,
    required: false,
    requiredByClass: true,
  },

  // 現場code
  code: { type: String, default: '', required: false, requiredByClass: false },

  // 現場名
  name: { type: String, default: '', required: false, requiredByClass: true },

  // 現場名略称
  abbr: { type: String, default: '', required: false, requiredByClass: true },

  // 現場名略称カナ
  abbrKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 略称コード（取引先から指定された現場のコードなど）
  abbrNumber: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 住所
  address: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 開始日
  startAt: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 終了日
  endAt: { type: String, default: '', required: false, requiredByClass: false },

  // 警備種別
  securityType: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 状態
  status: {
    type: String,
    default: 'active',
    required: false,
    requiredByClass: true,
  },

  // 備考
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // お気に入りフラグ
  favorite: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // 同期状態
  sync: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // スポット現場フラグ
  isSpot: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // 現場取極め存在フラグ
  hasContract: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  location: {
    type: Object,
    default: () => {
      return {
        formattedAddress: null,
        lat: null,
        lng: null,
      }
    },
    required: false,
  },
}

const { classProps } = generateProps(propsDefinition)

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class Site extends FireModel {
  // FireModel 設定
  static collectionPath = 'Sites'
  static useAutonumber = true
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['abbr', 'abbrKana']
  static hasMany = [
    {
      collection: 'OperationResults',
      field: 'siteId',
      condition: '==',
      type: 'collection',
    },
  ]

  // カスタムクラスマップ
  static customClassMap = { customer: CustomerMinimal }

  /**
   * Realtime Databaseの`AirGuard/Sites`の内容で、FirestoreのSitesドキュメントを更新します。
   * @param {string} code - Realtime Database内のSitesデータを識別するコード
   * @returns {Promise<void>} - 同期が正常に完了した場合は、解決されたPromiseを返します
   */
  static async syncFromAirGuard(code) {
    try {
      await syncToFirestoreFromAirGuard(code, 'Sites', this)
    } catch (err) {
      logger.error(err, { code })
      throw err
    }
  }

  /**
   * 指定された `siteId` の `Sites` ドキュメントの `hasContract` プロパティをトランザクション内で更新します。
   *
   * - このメソッドは Firestore トランザクションを使用して `Sites` ドキュメントを更新します。
   * - `SiteContracts` コレクション内に該当の `siteId` に紐づくドキュメントが存在するかどうかをチェックし、その結果に応じて `hasContract` プロパティを `true` または `false` に設定します。
   * - 既に `hasContract` プロパティの値が正しい場合は、更新処理はスキップされます。
   * - この処理はトランザクション内で行われるため、複数のクライアントが同時に `Sites` ドキュメントを更新する競合が発生した場合でもデータの一貫性が保証されます。
   *
   * ## 注意点:
   * - `transaction` は Firestore の原子操作を保証しますが、処理が失敗した場合に自動でリトライが行われることがあります。特に大量のドキュメントを操作する場合や競合の多い操作が行われる場合は、パフォーマンスに影響を与えることがあります。
   * - トランザクションは 500 ドキュメントまでの読み取り・書き込みが推奨されるため、規模の大きいシステムでは、適切にドキュメント数を管理してください。
   *
   * @param {string} siteId - 更新対象の `Sites` ドキュメントの ID
   * @returns {Promise<void>} - 処理が完了すると解決される Promise
   */
  static async refreshHasContract(siteId) {
    try {
      const siteDocRef = firestore.collection('Sites').doc(siteId)

      await firestore.runTransaction(async (transaction) => {
        // トランザクション内で `Sites` ドキュメントを取得
        const siteDocSnapshot = await transaction.get(siteDocRef)

        // ドキュメントが存在しない場合のエラーハンドリング
        if (!siteDocSnapshot.exists) {
          logger.info(
            `指定された現場ドキュメントは存在しませんでした。このメッセージは、現場ドキュメントが削除されたことにより現場取極めドキュメントが同期的に削除された場合に出力されることがあります。`,
            { siteId }
          )
          return
        }

        // 現在の `hasContract` プロパティの値を取得
        const currentHasContract = siteDocSnapshot.data().hasContract

        // `SiteContracts` ドキュメントが存在するかどうかを確認
        const contractQueryRef = firestore
          .collection('SiteContracts')
          .where('siteId', '==', siteId)
          .limit(1)
        const contractQuerySnapshot = await transaction.get(contractQueryRef)
        const existSiteContract = !contractQuerySnapshot.empty

        // `hasContract` プロパティに変更が必要な場合のみ更新処理を行う
        if (currentHasContract !== existSiteContract) {
          transaction.update(siteDocRef, { hasContract: existSiteContract })
        }
      })
    } catch (err) {
      logger.error('Error refreshing hasContract for siteId:', err)
      throw new Error(`Failed to refresh hasContract for siteId: ${siteId}`)
    }
  }
}

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class SiteMinimal extends Site {
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
export class SiteIndex extends SiteMinimal {
  // インデックスとして用意するプロパティを定義
  static keepProps = [
    'code',
    'name',
    'name2',
    'abbr',
    'abbrKana',
    'address',
    'customerId',
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
   * @param {string} siteId - インデックス作成対象の現場ID
   */
  static async create(siteId) {
    const functionName = 'create'
    try {
      await createIndex('Sites', siteId, this)
    } catch (error) {
      logger.error(`[${functionName}] ${error.message}`, { siteId })
      throw error
    }
  }

  /**
   * Realtime Database からインデックスを削除します。
   * @param {string} siteId - インデックス削除対象の現場ID
   */
  static async remove(siteId) {
    const functionName = 'remove'
    try {
      await removeIndex('Sites', siteId)
    } catch (error) {
      logger.error(`[${functionName}] ${error.message}`, { siteId })
      throw error
    }
  }
}
