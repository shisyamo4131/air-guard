import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import {
  createIndex,
  removeIndex,
  syncToFirestoreFromAirGuard,
} from '../modules/database.js'
import {
  extractDiffsFromDocUpdatedEvent,
  syncDependentDocuments,
} from '../modules/utils.js'
import { CustomerMinimal } from './Customer.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/Site.js'
const firestore = getFirestore()

/**
 * Cloud Functions で Firestore の Sites ドキュメントを操作するためのクラスです。
 * FireMode を継承していますが、更新系のメソッドは利用できません。
 * @author shisyamo4131
 */
export default class Site extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Sites'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    customer: CustomerMinimal,
  }

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
   * @param {string} code - Realtime Database内のSitesデータを識別するコード
   * @returns {Promise<void>} - 同期が正常に完了した場合は、解決されたPromiseを返します
   ****************************************************************************/
  static async syncFromAirGuard(code) {
    try {
      await syncToFirestoreFromAirGuard(code, 'Sites', this)
    } catch (err) {
      logger.error(err, { code })
      throw err
    }
  }

  /****************************************************************************
   * Sites ドキュメントの customer プロパティを更新します。
   * - 引数 event は Firestore の更新トリガーオブジェクトを受け取ります。
   * - event の before, after を比較し、更新が不要な場合は処理をスキップします。
   * @param {Object} event - Firestore の更新トリガーオブジェクト
   ****************************************************************************/
  static async refreshCustomer(event) {
    const isChanged = extractDiffsFromDocUpdatedEvent({
      event,
      ComparisonClass: Site.customClassMap.customer,
    })
    if (isChanged.length === 0) return
    await syncDependentDocuments(
      Site.collectionPath,
      'customer.docId',
      'customer',
      isChanged.data
    )
  }

  /****************************************************************************
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
   ****************************************************************************/
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

/**
 * Realtime Database で管理する Site インデックス用のクラスです。
 */
export class SiteIndex extends Site {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    // インデックスに必要なプロパティを定義
    const keepProps = [
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

    // Site クラスから不要なプロパティを削除
    Object.keys(this).forEach((key) => {
      if (!keepProps.includes(key)) delete this[key]
    })
  }

  /****************************************************************************
   * Realtime Database にインデックスを作成します。
   * @param {string} siteId - インデックス作成対象の現場ID
   ****************************************************************************/
  static async create(siteId) {
    const functionName = 'create'
    try {
      await createIndex('Sites', siteId, this)
    } catch (error) {
      logger.error(`[${functionName}] ${error.message}`, { siteId })
      throw error
    }
  }

  /****************************************************************************
   * Realtime Database からインデックスを削除します。
   * @param {string} siteId - インデックス削除対象の現場ID
   ****************************************************************************/
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

/**
 * Site クラスからカスタムクラス用に不要なプロパティを削除したクラスです。
 */
export class SiteMinimal extends Site {
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
