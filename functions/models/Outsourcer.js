import { getDatabase } from 'firebase-admin/database'
import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/Outsourcer.js'
import OutsourcerIndex from './OutsourcerIndex.js'
const database = getDatabase()
const firestore = getFirestore()

/**
 * Outsourcersドキュメントデータモデル【論理削除】
 *
 * @version 1.0.0
 * @author shisyamo4131
 */
export default class Outsourcer extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
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
   * Realtime DatabaseのOutsourcersインデックスを更新します。
   * - 指定された `outsourcerId ` に該当する `Outsourcers` ドキュメントを取得します。
   * - 取得したドキュメントから必要なデータを抽出してインデックスを更新します。
   * - `isDeleted` が true の場合、無条件にインデックスを削除して終了します。
   * @param {string} outsourcerId - 更新するOutsourcersインデックスのドキュメントID
   * @param {boolean} isDeleted - true の場合、インデックスを削除します。
   * @throws {Error} インデックスの更新に失敗した場合、エラーをスローします。
   ****************************************************************************/
  static async syncIndex(outsourcerId, isDeleted = false) {
    // Create reference to index in Realtime Database.
    const dbRef = database.ref(`Outsourcers/${outsourcerId}`)

    try {
      // インデックスの削除処理
      if (isDeleted) {
        await dbRef.remove()
        logger.info(`[syncIndex] インデックスが削除されました。`, {
          outsourcerId,
        })
        return
      }

      // Firestore から Outsourcer ドキュメントを取得
      const docRef = firestore.collection('Outsourcers').doc(outsourcerId)
      const docSnapshot = await docRef.get()

      // ドキュメントが存在しない場合のエラーハンドリング
      if (!docSnapshot.exists) {
        const message = `該当する Outsourcers ドキュメントが取得できませんでした。`
        logger.error(`[syncIndex] ${message}`, { outsourcerId })
        throw new Error(message)
      }

      // インデックスデータの作成
      const indexData = new OutsourcerIndex(docSnapshot.data())

      // インデックスを更新
      await dbRef.set(indexData)
      logger.info(`[syncIndex] インデックスが更新されました。`, {
        outsourcerId,
      })
    } catch (error) {
      // 修正: catchブロックで関数の引数のみをログ出力
      logger.error(
        `[syncIndex] インデックスの同期処理でエラーが発生しました。`,
        { outsourcerId }
      )
      throw error
    }
  }

  /****************************************************************************
   * Realtime Databaseの`AirGuard/Outsourcers`の内容で、FirestoreのOutsourcersドキュメントを更新します。
   * - Realtime Databaseからデータを取得し、そのデータに基づいてFirestore内の
   *   Outsourcersドキュメントを更新します。
   * - Firestoreの更新はトランザクションを使用して安全に行います。
   * - `docId`が存在しない場合や、データが存在しない場合はエラーが発生します。
   *
   * @param {string} code - Realtime Database内のOutsourcersデータを識別するコード
   * @returns {Promise<void>} - 同期が正常に完了した場合は、解決されたPromiseを返します
   ****************************************************************************/
  static async syncFromAirGuard(code) {
    try {
      // Realtime DatabaseからOutsourcerデータをロード
      const dbRef = database.ref(`AirGuard/Outsourcers/${code}`)
      const data = await dbRef.get()

      // データが存在しない場合はエラーを投げる
      if (!data.exists()) {
        const message = `Realtime Database に同期元の Outsourcers データが見つかりません。`
        logger.error(`[syncFromAirGuard] ${message}`, { code })
        throw new Error(message)
      }

      const newData = data.val()
      const docId = newData.docId

      // docIdが存在しない場合はエラーを投げる
      if (!docId) {
        const message = `Outsourcers データに docId が設定されていません。`
        logger.error(`[syncFromAirGuard] ${message}`, { code })
        throw new Error(message)
      }

      // Firestoreドキュメントをトランザクションで同期
      await firestore.runTransaction(async (transaction) => {
        const docRef = firestore.collection('Outsourcers').doc(docId)
        const docSnapshot = await transaction.get(docRef)

        // ドキュメントが存在しない場合はエラーを投げる
        if (!docSnapshot.exists) {
          const message = `Firestore に同期先の Outsourcers ドキュメントが見つかりません。`
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
        `[syncFromAirGuard] Realtime Database の Outsourcers データが Firestore の Outsourcers ドキュメントと正常に同期されました。`,
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
}
