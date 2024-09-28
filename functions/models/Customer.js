import { getDatabase } from 'firebase-admin/database'
import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/Customer.js'
import CustomerIndex from './CustomerIndex.js'
const database = getDatabase()
const firestore = getFirestore()

/**
 * Customersドキュメントデータモデル【論理削除】
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class Customer extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Customers'
  static useAutonumber = true
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['abbr', 'abbrKana']
  static hasMany = [
    {
      collection: 'Sites',
      field: 'customer.docId',
      condition: '==',
      type: 'collection',
    },
  ]

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
   * initializeメソッドをオーバーライドします。
   * - AirGuardからのインポート処理を想定した初期化処理を追加しています。
   * @param {Object} item
   ****************************************************************************/
  initialize(item = {}) {
    item.depositMonth = parseInt(item.depositMonth)
    super.initialize(item)
  }

  /****************************************************************************
   * Realtime DatabaseのCustomersインデックスを更新します。
   * - 指定された `customerId ` に該当する `Customers` ドキュメントを取得します。
   * - 取得したドキュメントから必要なデータを抽出してインデックスを更新します。
   * - `isDeleted` が true の場合、無条件にインデックスを削除して終了します。
   * @param {string} customerId - 更新するCustomersインデックスのドキュメントID
   * @param {boolean} isDeleted - true の場合、インデックスを削除します。
   * @throws {Error} インデックスの更新に失敗した場合、エラーをスローします。
   ****************************************************************************/
  static async syncIndex(customerId, isDeleted = false) {
    // Create reference to index in Realtime Database.
    const dbRef = database.ref(`Customers/${customerId}`)

    try {
      // インデックスの削除処理
      if (isDeleted) {
        await dbRef.remove()
        logger.info(`[syncIndex] インデックスが削除されました。`, {
          customerId,
        })
        return
      }

      // Firestore から Customer ドキュメントを取得
      const docRef = firestore.collection('Customers').doc(customerId)
      const docSnapshot = await docRef.get()

      // ドキュメントが存在しない場合のエラーハンドリング
      if (!docSnapshot.exists) {
        const message = `該当する Customers ドキュメントが取得できませんでした。`
        logger.error(`[syncIndex] ${message}`, { customerId })
        throw new Error(message)
      }

      // インデックスデータの作成
      const indexData = new CustomerIndex(docSnapshot.data())

      // インデックスを更新
      await dbRef.set(indexData)
      logger.info(`[syncIndex] インデックスが更新されました。`, { customerId })
    } catch (error) {
      // 修正: catchブロックで関数の引数のみをログ出力
      logger.error(
        `[syncIndex] インデックスの同期処理でエラーが発生しました。`,
        { customerId }
      )
      throw error
    }
  }

  /****************************************************************************
   * Realtime Databaseの`AirGuard/Customers`の内容で、FirestoreのCustomersドキュメントを更新します。
   * - Realtime Databaseからデータを取得し、そのデータに基づいてFirestore内の
   *   Customersドキュメントを更新します。
   * - Firestoreの更新はトランザクションを使用して安全に行います。
   * - `docId`が存在しない場合や、データが存在しない場合はエラーが発生します。
   *
   * @param {string} code - Realtime Database内のCustomersデータを識別するコード
   * @returns {Promise<void>} - 同期が正常に完了した場合は、解決されたPromiseを返します
   ****************************************************************************/
  static async syncFromAirGuard(code) {
    try {
      // Realtime DatabaseからCustomerデータをロード
      const dbRef = database.ref(`AirGuard/Customers/${code}`)
      const data = await dbRef.get()

      // データが存在しない場合はエラーを投げる
      if (!data.exists()) {
        const message = `Realtime Database に同期元の Customers データが見つかりません。`
        logger.error(`[syncFromAirGuard] ${message}`, { code })
        throw new Error(message)
      }

      const newData = data.val()
      const docId = newData.docId

      // docIdが存在しない場合はエラーを投げる
      if (!docId) {
        const message = `Customers データに docId が設定されていません。`
        logger.error(`[syncFromAirGuard] ${message}`, { code })
        throw new Error(message)
      }

      // Firestoreドキュメントをトランザクションで同期
      await firestore.runTransaction(async (transaction) => {
        const docRef = firestore.collection('Customers').doc(docId)
        const docSnapshot = await transaction.get(docRef)

        // ドキュメントが存在しない場合はエラーを投げる
        if (!docSnapshot.exists) {
          const message = `Firestore に同期先の Customers ドキュメントが見つかりません。`
          logger.error(`[syncFromAirGuard] ${message}`, { code, docId })
          throw new Error(message)
        }

        // 既存データと新しいデータをマージし、インスタンスを作成
        // AirGuardとの同期設定済みであることを表す `sync` プロパティを true にする
        const instance = new this({
          ...docSnapshot.data(),
          ...newData,
          sync: true,
        })

        // ドキュメントを更新
        transaction.update(docRef, instance.toObject())
      })

      // 同期完了メッセージ
      logger.info(
        `[syncFromAirGuard] Realtime Database の Customers データが Firestore の Customers ドキュメントと正常に同期されました。`,
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
   * 指定された `customerId` に基づき、`Sites` ドキュメントの `customer` プロパティを同期します。
   * - `Sites` ドキュメントはバッチ処理で同期されます。
   * - `batchLimit` の数でバッチのサイズを指定し、`batchDelay` ミリ秒でバッチごとの遅延を指定します。
   * @param {string} customerId - 同期対象の `Customers` ドキュメントの ID
   * @param {Object} [param1] - オプション引数
   * @param {number} [param1.batchLimit=500] - 一度に処理するドキュメントの数
   * @param {number} [param1.batchDelay=100] - バッチごとの遅延時間 (ミリ秒)
   * @returns {Promise<void>}
   ****************************************************************************/
  static async syncToSite(
    customerId,
    { batchLimit = 500, batchDelay = 100 } = {}
  ) {
    try {
      const docRef = firestore.collection('Customers').doc(customerId)
      const docSnapshot = await docRef.get()
      if (!docSnapshot.exists) {
        const message = `Customers ドキュメントが存在しません。`
        logger.error(`[syncToSite] ${message}`, { customerId })
        throw new Error(message)
      }

      const customer = docSnapshot.data()

      const queryRef = firestore
        .collection('Sites')
        .where('customerId', '==', customerId)
      const querySnapshot = await queryRef.get()
      if (querySnapshot.empty) {
        const message = `同期対象の Sites ドキュメントが存在しませんでした。`
        logger.info(`[syncToSite] ${message}`, { customerId })
        return
      }
      const docCount = querySnapshot.docs.length
      const message = `${docCount} 件の Sites ドキュメントを更新します。`
      logger.info(`[syncToSite] ${message}`, { customerId })

      const batchArray = []
      for (let i = 0; i < docCount; i++) {
        if (i % batchLimit === 0) batchArray.push(firestore.batch())
        const currentBatch = batchArray[batchArray.length - 1]
        const doc = querySnapshot.docs[i]
        currentBatch.update(doc.ref, { customer })
      }

      // Commit each batch with delay
      for (const batch of batchArray) {
        await batch.commit()
        if (batchDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, batchDelay))
        }
      }

      logger.info(`[syncToSite] Sites ドキュメントの同期処理が完了しました。`, {
        customerId,
      })
    } catch (err) {
      // エラー処理を一元化し、詳細なログを出力
      logger.error(
        `[syncToSite] 同期処理でエラーが発生しました: ${err.message}`,
        { customerId, err }
      )
      throw err
    }
  }
}
