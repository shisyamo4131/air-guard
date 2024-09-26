import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import Customer from './Customer.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/Site.js'
const firestore = getFirestore()

/**
 * Sitesドキュメントデータモデル【論理削除】
 *
 * - 現場情報を管理するデータモデルです。
 * - `code`は Autonumbers による自動採番が行われます。
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class Site extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Sites'
  static useAutonumber = true
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['abbr', 'abbrKana']
  static hasMany = [
    {
      collection: 'SiteOperationSchedules',
      field: 'siteId',
      condition: '==',
      type: 'subcollection',
    },
    {
      collection: 'OperationResults',
      field: 'siteId',
      condition: '==',
      type: 'collection',
    },
  ]

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    customer: Customer,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.create
    delete this.update
    delete this.delete
  }

  /****************************************************************************
   * 指定された現場codeに該当する現場ドキュメントデータを配列で返します。
   * @param {string} code - 現場コード
   * @returns {Promise<Array>} - 現場ドキュメントデータの配列
   * @throws {Error} - エラーが発生した場合にスローされます
   ****************************************************************************/
  async fetchByCode(code) {
    if (!code) throw new Error('Code is required.')
    try {
      const constraints = [['where', 'code', '==', code]]
      const snapshots = await this.fetchDocs(constraints)
      return snapshots
    } catch (err) {
      logger.error(
        `[Site.js fetchByCode] Error fetching documents for code ${code}: ${err.message}`
      )
      throw err
    }
  }

  /****************************************************************************
   * 現場codeの配列を受け取り、該当する現場ドキュメントデータを配列で返します。
   * 現場codeの配列は、重複があれば一意に整理されます。
   * @param {Array<string>} codes - 現場コードの配列
   * @returns {Promise<Array>} - 現場ドキュメントデータの配列
   * @throws {Error} - 処理中にエラーが発生した場合にスローされます
   ****************************************************************************/
  async fetchByCodes(codes) {
    if (!Array.isArray(codes) || codes.length === 0) return []
    try {
      const unique = [...new Set(codes)]
      const chunked = unique.flatMap((_, i) =>
        i % 30 ? [] : [unique.slice(i, i + 30)]
      )
      const promises = chunked.map(async (arr) => {
        const constraints = [['where', 'code', 'in', arr]]
        return await this.fetchDocs(constraints)
      })
      const snapshots = await Promise.all(promises)
      return snapshots.flat()
    } catch (err) {
      logger.error(
        `[Site.js fetchByCodes] Error fetching documents: ${err.message}`
      )
      throw err
    }
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
          throw new Error(`Site document with ID ${siteId} does not exist.`)
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
