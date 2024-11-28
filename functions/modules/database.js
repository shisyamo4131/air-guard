/**
 * Realtime Database に対する処理を行う共通関数
 */
import { getDatabase } from 'firebase-admin/database'
import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'

const database = getDatabase()
const firestore = getFirestore()

/*****************************************************************************
 * 指定されたドキュメントを Firestore から読み込み Realtime Database にインデックスデータを作成します。
 * @param {string} collectionId - インデックス作成対象のコレクション名
 * @param {string} documentId - インデックス作成対象のドキュメントID
 * @param {Object} IndexClass - インデックスに必要なプロパティを実装したクラス
 * @return {Promise<void>} - インデックス作成が完了したら解決されるPromise
 * @throws {Error} - ドキュメントが存在しない場合や、インデックス作成処理でエラーが発生した場合にエラーを投げます。
 *****************************************************************************/
export const createIndex = async (collectionId, documentId, IndexClass) => {
  const functionName = 'createIndex'
  const dbRef = database.ref(`${collectionId}/${documentId}`)

  try {
    const docRef = firestore.collection(collectionId).doc(documentId)
    const docSnapshot = await docRef.get()

    if (!docSnapshot.exists) {
      const message = `該当するドキュメントが取得できませんでした。`
      logger.error(`[${functionName}] ${message}`, { collectionId, documentId })
      throw new Error(message)
    }

    // IndexClassを使ってインデックスデータを作成
    const indexData = new IndexClass(docSnapshot.data())

    // Realtime Databaseにインデックスデータを設定
    await dbRef.set(indexData)

    // 成功ログ出力
    logger.info(`[${functionName}] インデックスの作成処理が完了しました。`, {
      collectionId,
      documentId,
    })
  } catch (error) {
    const message = `インデックスの作成処理でエラーが発生しました。`
    logger.error(`[${functionName}] ${message}`, { collectionId, documentId })
    throw error
  }
}

/*****************************************************************************
 * 指定されたRealtime Databaseのインデックスデータを削除します。
 * @param {string} collectionId - インデックス削除対象のコレクション名
 * @param {string} documentId - インデックス削除対象のドキュメントID
 * @return {Promise<void>} - インデックス削除が完了したら解決されるPromise
 * @throws {Error} - 削除処理でエラーが発生した場合にエラーを投げます。
 *****************************************************************************/
export const removeIndex = async (collectionId, documentId) => {
  const functionName = 'removeIndex'
  const dbRef = database.ref(`${collectionId}/${documentId}`)

  try {
    // Realtime Databaseからのデータ削除
    await dbRef.remove()

    // 成功ログ出力
    logger.info(`[${functionName}] インデックスの削除処理が完了しました。`, {
      collectionId,
      documentId,
    })
  } catch (error) {
    const message = `インデックスの削除処理でエラーが発生しました。`
    logger.error(`[${functionName}] ${message}`, { collectionId, documentId })
    throw error
  }
}

/*****************************************************************************
 * 指定された AirGuard データを Firestore に同期させます。
 * - AirGuard データが更新された際に呼び出されることを想定しています。
 * @param {string} code - Firestore ドキュメントに同期する AirGuard データの CODE
 * @param {string} collectionId - 同期対象の Firestore コレクション名
 * @param {Object} ModelClass - データモデルを定義したクラス
 * @param {function} converter - AirGuard データを返還するための関数（オプション）
 * @returns {Promise<void>} - 同期が完了すると解決される Promise
 *****************************************************************************/
export const syncToFirestoreFromAirGuard = async (
  code,
  collectionId,
  ModelClass,
  converter = null
) => {
  const functionName = 'syncToFirestoreFromAirGuard'
  try {
    // Realtime Database の AirGuard からデータを読み込む
    const dbRef = database.ref(`AirGuard/${collectionId}/${code}`)
    const data = await dbRef.get()

    // データが存在しない場合はエラーを投げる
    if (!data.exists()) {
      const message = `Realtime Database の AirGuard に指定された ${collectionId} データが見つかりません。`
      logger.error(`[${functionName}] ${message}`, { code })
      throw new Error(message)
    }

    // 取得したデータを conveter が指定されていれば変換しておく
    const newData = converter ? converter(data.val()) : data.val()
    const docId = newData.docId

    // docId が存在しない場合は未同期であるためログを出力して終了
    if (!docId) {
      const message = `指定されたデータは未同期のようです。データに docId が設定されていません。`
      logger.info(`[${functionName}] ${message}`, { collectionId, code })
      return
    }

    // Firestoreドキュメントをトランザクションで同期
    await firestore.runTransaction(async (transaction) => {
      const docRef = firestore.collection(collectionId).doc(docId)
      const docSnapshot = await transaction.get(docRef)

      // ドキュメントが存在しない場合はエラーを投げる
      if (!docSnapshot.exists) {
        const message = `Firestore に同期先の ${collectionId} ドキュメントが見つかりません。`
        logger.error(`[${functionName}] ${message}`, { code, docId })
        throw new Error(message)
      }

      // 既存データと新しいデータをマージし、インスタンスを作成
      // AirGuardとの同期設定済みであることを表す `sync` プロパティを true にする
      const instance = new ModelClass({
        ...docSnapshot.data(),
        ...newData,
        sync: true,
      })

      // ドキュメントを更新
      transaction.update(docRef, instance.toObject())
    })

    // 同期完了メッセージ
    logger.info(
      `[${functionName}] Realtime Database の ${collectionId} データが Firestore の ${collectionId} ドキュメントと正常に同期されました。`,
      { code, docId }
    )
  } catch (err) {
    // エラー処理を一元化し、詳細なログを出力
    logger.error(
      `[${functionName}] 同期処理でエラーが発生しました: ${err.message}`,
      { code, err }
    )
    throw err
  }
}
