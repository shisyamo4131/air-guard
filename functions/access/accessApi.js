/**
 * Access版AirGuardとの連携処理モジュールです。
 */
import { getDatabase } from 'firebase-admin/database'
import { onRequest } from 'firebase-functions/https'
import { logger } from 'firebase-functions/v2'
import { onValueCreated } from 'firebase-functions/database'
import { mapFieldsToEnglish, mapTableToCollection } from './mapFields.js'

const database = getDatabase()

// 許可するデータの種類（日本語のテーブル名）
const allowedTypes = ['t_取引先']

// 許可するアクションの種類
const allowedActions = ['create', 'update', 'delete']

/**
 * Access版AirGuardからデータを受け取るためのAPIを提供します。
 */
export const saveAccessData = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }

  logger.log('Received body:', req.body) // リクエストボディをログ出力

  try {
    const { type, action, data } = req.body

    // データ検証
    if (!type || !action || !data) {
      res.status(400).send('Invalid data')
      return
    }

    if (!allowedTypes.includes(type)) {
      logger.info(
        `Received data for type "${type}", which is not currently supported. Ignoring.`
      )
      res.status(200).send({
        message: `Data for type "${type}" is not supported and was ignored.`,
      })
      return
    }

    if (!allowedActions.includes(action)) {
      res.status(400).send('Invalid action')
      return
    }

    // テーブル名をFirestoreコレクション名にマッピング
    const collectionName = mapTableToCollection(type)

    // フィールド名を英語にマッピング
    const mappedData = mapFieldsToEnglish(data, type)

    // Realtime Databaseにデータを書き込む
    const ref = database.ref('AccessData')
    const timestampedKey = createNumericKey()

    await ref.child(timestampedKey).set({
      type: collectionName, // マッピング後のコレクション名を保存
      action,
      data: mappedData,
      receivedAt: Date.now(),
    })

    res.status(200).send({
      message: 'Data saved successfully',
      key: timestampedKey,
    })
  } catch (error) {
    logger.error('Error saving data:', error)
    res.status(500).send('Error saving data')
  }
})

/**
 * AccessDataノードにデータが作成された時の処理です。
 */
export const handleAccessData = onValueCreated(
  { ref: `/AccessData/{id}`, region: 'us-central1' },
  async (event) => {
    const { id } = event.params
    const snapshot = event.data
    const data = snapshot.val()

    if (!data) {
      logger.error(`No data found for id: ${id}`)
      return
    }

    const { type, action, data: record } = data

    if (!type || !action || !record) {
      logger.error(
        `Invalid data format for id: ${id}, type: ${type}, action: ${action}`
      )
      return
    }

    try {
      switch (type) {
        case 'Customers':
          await handleCustomersData(record)
          break
        default:
          logger.error(
            `Invalid type for id: ${id}, type: ${type}, action: ${action}`
          )
      }
    } catch (error) {
      logger.error(
        `Error processing data for id: ${id}, type: ${type}, action: ${action}`,
        error
      )
    } finally {
      // Realtime Databaseのデータ削除
      await database.ref(event.ref).remove()
      logger.info(
        `Processed and removed data for id: ${id}, type: ${type}, action: ${action}`
      )
    }
  }
)

// 数値型のキーを生成する関数
const createNumericKey = () => {
  const now = Date.now() // エポックタイム（ミリ秒単位）
  const randomSuffix = Math.random().toString(36).substring(2, 8) // ランダムな6文字
  return `${now}_${randomSuffix}`
}

/**
 * Customersコレクションへの反映を行う関数
 * - Realtime Database の AirGuard ノードにデータを反映させます。
 * - 以降、CSVデータのインポート処理と同じ流れで Firestore ドキュメントに同期されます。
 * NOTE:
 * codeをキーにしてFirestoreドキュメントを検索し、見つかったdocIdを更に反映させることで
 * 同期処理まで自動化することを検討しましたが、Web版で先に登録されていたドキュメントと
 * Access版で登録したレコードが異なるものであった場合に、codeの一致のみで同期させることは
 * リスクがあるため断念しました。
 */
const handleCustomersData = async (record) => {
  // AirGuard ノードへの反映
  const dbRef = database.ref(`/AirGuard/Customers/${record.code}`)
  await dbRef.update(record)
}
