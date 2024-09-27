import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import { getDatabase } from 'firebase-admin/database'
import Customer from './Customer.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/Site.js'
const database = getDatabase()
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
   * Realtime DatabaseのSitesインデックスを更新します。
   * - 指定された `siteId ` に該当する `Sites` ドキュメントを取得します。
   * - 取得したドキュメントから必要なデータを抽出してインデックスを更新します。
   * - `isDeleted` が true の場合、無条件にインデックスを削除して終了します。
   * @param {string} siteId - 更新するSitesインデックスのドキュメントID
   * @param {boolean} isDeleted - true の場合、インデックスを削除します。
   * @throws {Error} インデックスの更新に失敗した場合、エラーをスローします。
   ****************************************************************************/
  static async syncIndex(siteId, isDeleted = false) {
    // Create reference to index in Realtime Database.
    const dbRef = database.ref(`Sites/${siteId}`)

    try {
      // インデックスの削除処理
      if (isDeleted) {
        await dbRef.remove()
        logger.info(`[syncIndex] インデックスが削除されました。`, {
          siteId,
        })
        return
      }

      // Firestore から Site ドキュメントを取得
      const docRef = firestore.collection('Sites').doc(siteId)
      const docSnapshot = await docRef.get()

      // ドキュメントが存在しない場合のエラーハンドリング
      if (!docSnapshot.exists) {
        const message = `該当する Sites ドキュメントが取得できませんでした。`
        logger.error(`[syncIndex] ${message}`, { siteId })
        throw new Error(message)
      }

      // インデックスデータの作成
      const indexData = {
        code: docSnapshot.data().code,
        name: docSnapshot.data().name,
        abbr: docSnapshot.data().abbr,
        abbrKana: docSnapshot.data().abbrKana,
        address: docSnapshot.data().address,
        customerId: docSnapshot.data().customerId,
        status: docSnapshot.data().status,
      }

      // インデックスを更新
      await dbRef.set(indexData)
      logger.info(`[syncIndex] インデックスが更新されました。`, { siteId })
    } catch (error) {
      // 修正: catchブロックで関数の引数のみをログ出力
      logger.error(
        `[syncIndex] インデックスの同期処理でエラーが発生しました。`,
        { siteId }
      )
      throw error
    }
  }

  /****************************************************************************
   * Realtime Databaseの`AirGuard/Sites`の内容で、FirestoreのSitesドキュメントを更新します。
   * - Realtime Databaseからデータを取得し、そのデータに基づいてFirestore内の
   *   Sitesドキュメントを更新します。
   * - Firestoreの更新はトランザクションを使用して安全に行います。
   * - `docId`が存在しない場合や、データが存在しない場合はエラーが発生します。
   *
   * @param {string} code - Realtime Database内のSitesデータを識別するコード
   * @returns {Promise<void>} - 同期が正常に完了した場合は、解決されたPromiseを返します
   ****************************************************************************/
  static async syncFromAirGuard(code) {
    try {
      // Realtime DatabaseからSitesデータをロード
      const dbRef = database.ref(`AirGuard/Sites/${code}`)
      const data = await dbRef.get()

      // データが存在しない場合はエラーを投げる
      if (!data.exists()) {
        const message = `Realtime Database に同期元の Sites データが見つかりません。`
        logger.error(`[syncFromAirGuard] ${message}`, { code })
        throw new Error(message)
      }

      const newData = data.val()
      const docId = newData.docId
      const customerCode = newData.customerCode

      // docIdが存在しない場合はエラーを投げる
      if (!docId) {
        const message = `Sites データに docId が設定されていません。`
        logger.error(`[syncFromAirGuard] ${message}`, { code })
        throw new Error(message)
      }

      // customerCode に該当する Customers ドキュメントが存在しなければエラーを投げる
      const customerQueryRef = firestore
        .collection('Customers')
        .where('code', '==', customerCode)
      const customerQuerySnapshot = await customerQueryRef.get()
      if (customerQuerySnapshot.empty) {
        const message = `Customers ドキュメントが存在しません。`
        logger.error(`[syncFromAirGuard] ${message}`, { customerCode })
        throw new Error(message)
      }
      const customer = customerQuerySnapshot.docs[0].data()

      // Firestoreドキュメントをトランザクションで同期
      await firestore.runTransaction(async (transaction) => {
        const docRef = firestore.collection('Sites').doc(docId)
        const docSnapshot = await transaction.get(docRef)

        // ドキュメントが存在しない場合はエラーを投げる
        if (!docSnapshot.exists) {
          const message = `Firestore に同期先の Sites ドキュメントが見つかりません。`
          logger.error(`[syncFromAirGuard] ${message}`, { code, docId })
          throw new Error(message)
        }

        // 既存データと新しいデータをマージし、インスタンスを作成
        // AirGuardとの同期設定済みであることを表す `sync` プロパティを true にする
        const instance = new this({
          ...docSnapshot.data(),
          ...newData,
          customerId: customer.docId,
          customer,
          sync: true,
        })

        // ドキュメントを更新
        transaction.update(docRef, instance.toObject())
      })

      // 同期完了メッセージ
      logger.info(
        `[syncFromAirGuard] Realtime Database の Sites データが Firestore の Sites ドキュメントと正常に同期されました。`,
        { code, docId }
      )
    } catch (err) {
      // エラー処理を一元化し、詳細なログを出力
      logger.error(
        `[syncFromAirGuard] 同期処理でエラーが発生しました: ${err.message}`,
        { code, err }
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

  /****************************************************************************
   * 指定された `docId` に基づき、`SiteContracts` ドキュメントの `site` プロパティを同期します。
   * - `SiteContracts` ドキュメントはバッチ処理で同期されます。
   * - `batchLimit` の数でバッチのサイズを指定し、`batchDelay` ミリ秒でバッチごとの遅延を指定します。
   * @param {string} docId - 同期対象の Sites ドキュメントの ID
   * @param {Object} [param1] - オプション引数
   * @param {number} [param1.batchLimit=500] - 一度に処理するドキュメントの数
   * @param {number} [param1.batchDelay=100] - バッチごとの遅延時間 (ミリ秒)
   * @returns {Promise<void>}
   ****************************************************************************/
  static async syncToSiteContracts(
    docId,
    { batchLimit = 500, batchDelay = 100 } = {}
  ) {
    logger.info(
      `[syncToSiteContracts] SiteContracts ドキュメントの同期処理を開始します。`,
      { siteId: docId }
    )
    try {
      // Load site document and throw error if the document does not exist.
      const docRef = firestore.collection('Sites').doc(docId)

      const docSnapshot = await docRef.get()
      if (!docSnapshot.exists) {
        const message = `指定された Sites ドキュメントが存在しません。`
        logger.error(`[syncToSiteContracts] ${message}`, { siteId: docId })
        throw new Error(message)
      }

      const site = docSnapshot.data()

      // Load SiteContracts documents.
      const colRef = firestore.collection('SiteContracts')
      const queryRef = colRef.where('siteId', '==', docId)
      const querySnapshot = await queryRef.get()

      // No documents found case
      if (querySnapshot.empty) {
        const message = `同期対象の SiteContracts ドキュメントはありませんでした。`
        logger.info(`[syncToSiteContracts] ${message}`, { siteId: docId })
        return
      }

      const docCount = querySnapshot.docs.length
      const message = `${docCount} 件の SiteContracts ドキュメントを更新します。`
      logger.info(`[syncToSiteContracts] ${message}`, { siteId: docId })

      // Synchronize SiteContracts documents as batch.
      const batchArray = []
      for (let i = 0; i < docCount; i++) {
        if (i % batchLimit === 0) batchArray.push(firestore.batch())
        const currentBatch = batchArray[batchArray.length - 1]
        const doc = querySnapshot.docs[i]
        currentBatch.update(doc.ref, { site })
      }

      // Commit each batch with delay
      for (const batch of batchArray) {
        await batch.commit()
        if (batchDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, batchDelay))
        }
      }

      logger.info(
        `[syncToSiteContracts] SiteContracts ドキュメントの同期処理が完了しました。`,
        { siteId: docId }
      )
    } catch (error) {
      // エラーハンドリングを詳細化
      logger.error(
        `[syncToSiteContracts] エラーが発生しました: ${error.message}`,
        { siteId: docId, error }
      )
      throw error
    }
  }

  /****************************************************************************
   * 指定された `docId` に基づき、`OperationResults` ドキュメントの `site` プロパティを同期します。
   * - `OperationResults` ドキュメントはバッチ処理で同期されます。
   * - `batchLimit` の数でバッチのサイズを指定し、`batchDelay` ミリ秒でバッチごとの遅延を指定します。
   * @param {string} docId - 同期対象の Sites ドキュメントの ID
   * @param {Object} [param1] - オプション引数
   * @param {number} [param1.batchLimit=500] - 一度に処理するドキュメントの数
   * @param {number} [param1.batchDelay=100] - バッチごとの遅延時間 (ミリ秒)
   * @returns {Promise<void>}
   ****************************************************************************/
  static async syncToOperationResults(
    docId,
    { batchLimit = 500, batchDelay = 100 } = {}
  ) {
    logger.info(
      `[syncToOperationResults] OperationResults ドキュメントの同期処理を開始します。`,
      { siteId: docId }
    )
    try {
      // Load site document and throw error if the document does not exist.
      const docRef = firestore.collection('Sites').doc(docId)

      const docSnapshot = await docRef.get()
      if (!docSnapshot.exists) {
        const message = `指定された Sites ドキュメントが存在しません。`
        logger.error(`[syncToOperationResults] ${message}`, { siteId: docId })
        throw new Error(message)
      }

      const site = docSnapshot.data()

      // Load OperationResults documents.
      const colRef = firestore.collection('OperationResults')
      const queryRef = colRef.where('siteId', '==', docId)
      const querySnapshot = await queryRef.get()

      // No documents found case
      if (querySnapshot.empty) {
        const message = `同期対象の OperationResults ドキュメントはありませんでした。`
        logger.info(`[syncToOperationResults] ${message}`, { siteId: docId })
        return
      }

      const docCount = querySnapshot.docs.length
      const message = `${docCount} 件の OperationResults ドキュメントを更新します。`
      logger.info(`[syncToOperationResults] ${message}`, { siteId: docId })

      // Synchronize OperationResults documents as batch.
      const batchArray = []
      for (let i = 0; i < docCount; i++) {
        if (i % batchLimit === 0) batchArray.push(firestore.batch())
        const currentBatch = batchArray[batchArray.length - 1]
        const doc = querySnapshot.docs[i]
        currentBatch.update(doc.ref, { site })
      }

      // Commit each batch with delay
      for (const batch of batchArray) {
        await batch.commit()
        if (batchDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, batchDelay))
        }
      }

      logger.info(
        `[syncToOperationResults] OperationResults ドキュメントの同期処理が完了しました。`,
        { siteId: docId }
      )
    } catch (error) {
      // エラーハンドリングを詳細化
      logger.error(
        `[syncToOperationResults] エラーが発生しました: ${error.message}`,
        { siteId: docId, error }
      )
      throw error
    }
  }
}
