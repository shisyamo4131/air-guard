/**
 * utils.js
 */

import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

// dayjsのプラグインを有効化
dayjs.extend(utc)
dayjs.extend(timezone)

const firestore = getFirestore()
const BATCH_LIMIT = 500

/**
 * 深夜時間帯の設定
 */
const NIGHT_TIME_START = '22:00'
const NIGHT_TIME_END = '05:00'

/*****************************************************************************
 * 指定した日時を基準に、夜間時間帯（22:00～翌朝5:00）の開始・終了を計算します。
 *
 * @param {string|Date|number} dateTime - 基準となる日時
 *   - ISO8601形式、Dateオブジェクト、またはタイムスタンプで指定可能
 * @returns {Object} 夜間時間帯の開始・終了
 *   - { before: { start: dayjs, end: dayjs }, after: { start: dayjs, end: dayjs } }
 *     - `before`: 基準日時の前日から当日の夜間時間帯
 *     - `after`: 基準日時の当日から翌日の夜間時間帯
 *****************************************************************************/
export const getNighttimeRange = (dateTime) => {
  // 夜間時間帯の開始・終了時刻を取得
  const [NIGHT_START_HOUR, NIGHT_START_MINUTE] =
    NIGHT_TIME_START.split(':').map(Number)
  const [NIGHT_END_HOUR, NIGHT_END_MINUTE] =
    NIGHT_TIME_END.split(':').map(Number)

  // 指定日時を日本時間（JST）に変換
  const jst = dayjs(dateTime).tz('Asia/Tokyo')

  /**
   * 指定日を基準に夜間時間帯を計算するヘルパー関数
   * @param {number} offsetDays - 基準日からのオフセット（日単位）
   * @returns {{ start: dayjs, end: dayjs }} 夜間時間帯の開始と終了
   */
  const calculateNighttime = (offsetDays) => {
    const start = jst
      .clone()
      .add(offsetDays, 'day')
      .set('hour', NIGHT_START_HOUR)
      .set('minute', NIGHT_START_MINUTE)
      .set('second', 0)
      .set('millisecond', 0)

    const end = jst
      .clone()
      .add(offsetDays + (NIGHT_END_HOUR < NIGHT_START_HOUR ? 1 : 0), 'day') // 夜間終了が翌日にまたがる場合に1日追加
      .set('hour', NIGHT_END_HOUR)
      .set('minute', NIGHT_END_MINUTE)
      .set('second', 0)
      .set('millisecond', 0)

    return { start, end }
  }

  // 前日と翌日の夜間時間帯を計算
  const before = calculateNighttime(-1)
  const after = calculateNighttime(0)

  return { before, after }
}

/*****************************************************************************
 * 2つの与えられた時間帯のオーバーラップを分単位で計算して返します。
 * @param {Object} range1 時間帯1
 * @param {string} range1.start - 開始日時（ISO8601タイムスタンプまたはタイムゾーン付き）
 * @param {string} range1.end - 終了日時（ISO8601タイムスタンプまたはタイムゾーン付き）
 * @param {Object} range2 時間帯2
 * @param {string} range2.start - 開始日時（ISO8601タイムスタンプまたはタイムゾーン付き）
 * @param {string} range2.end - 終了日時（ISO8601タイムスタンプまたはタイムゾーン付き）
 * @returns {number} オーバーラップする時間（分単位）
 *****************************************************************************/
export const calcOverlapMinutes = (range1, range2) => {
  // タイムスタンプを UTC に変換
  const start1 = dayjs.tz(range1.start).utc().valueOf()
  const end1 = dayjs.tz(range1.end).utc().valueOf()
  const start2 = dayjs.tz(range2.start).utc().valueOf()
  const end2 = dayjs.tz(range2.end).utc().valueOf()

  // オーバーラップの開始と終了を計算
  const overlapStart = Math.max(start1, start2)
  const overlapEnd = Math.min(end1, end2)

  // オーバーラップ時間を計算（ミリ秒）
  const overlapMillis = Math.max(0, overlapEnd - overlapStart)

  // 分に変換して返す
  return Math.floor(overlapMillis / (1000 * 60))
}

/**
 * Firestore のドキュメント更新イベントを受け取り、差分に関するデータを返します。
 * ComparisonClass を指定すると、比較対象のプロパティを限定することが可能です。
 *
 * @param {Object} params - パラメータオブジェクト
 * @param {Object} params.event - Firestore の更新トリガーイベントオブジェクト
 * @param {Function} [params.ComparisonClass] - (オプション) データをインスタンス化する比較用クラス
 * @returns {Object} 差分情報を含むオブジェクト
 * @returns {number} result.length - 差分を検知したプロパティ数
 * @returns {Object} result.data - afterData（またはクラスを使用して変換された結果）
 */
export const extractDiffsFromDocUpdatedEvent = ({ event, ComparisonClass }) => {
  if (!event || !event.data) {
    throw new TypeError('有効な Firestore イベントオブジェクトが必要です。')
  }

  // Firestore 更新トリガーから beforeData と afterData を抽出
  const beforeData = event.data.before?.data() || null
  const afterData = event.data.after?.data() || null

  if (!beforeData || !afterData) {
    throw new TypeError(
      'Firestore イベントの before または after データが無効です。'
    )
  }

  // findDifferences を呼び出し、差分を検出
  return findDifferences({
    beforeData,
    afterData,
    ComparisonClass,
  })
}

/**
 * 2つのデータ間の差分を比較し、変更箇所の情報を返します。
 * 必要に応じて指定された比較用クラスを利用してデータをインスタンス化し、比較を行います。
 *
 * @param {Object} params - パラメータオブジェクト
 * @param {Object} params.beforeData - 比較対象の1つ目のデータ
 * @param {Object} params.afterData - 比較対象の2つ目のデータ
 * @param {Function} [params.ComparisonClass] - (オプション) データをインスタンス化する比較用クラス
 * @returns {Object} - 差分情報を含むオブジェクト
 * @returns {number} result.length - 差分を検知したプロパティ数
 * @returns {Object} result.data - afterData（またはクラスを使用して変換された結果）
 */
export const findDifferences = ({ beforeData, afterData, ComparisonClass }) => {
  if (
    typeof beforeData !== 'object' ||
    beforeData === null ||
    typeof afterData !== 'object' ||
    afterData === null
  ) {
    throw new TypeError('比較する対象はオブジェクトである必要があります。')
  }

  let before = beforeData
  let after = afterData

  // 比較用クラスが指定されている場合
  if (ComparisonClass) {
    if (
      typeof ComparisonClass !== 'function' ||
      !ComparisonClass.prototype ||
      ComparisonClass.prototype.constructor !== ComparisonClass
    ) {
      throw new TypeError(
        'ComparisonClass は有効なクラスである必要があります。'
      )
    }

    before = new ComparisonClass(beforeData).toObject()
    after = new ComparisonClass(afterData).toObject()
  }

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)])
  const differences = []

  for (const key of allKeys) {
    const valueA = before[key]
    const valueB = after[key]

    if (Array.isArray(valueA) && Array.isArray(valueB)) {
      // 配列の比較
      if (
        valueA.length !== valueB.length ||
        !valueA.every((val, idx) => val === valueB[idx])
      ) {
        differences.push({ key, valueA, valueB })
      }
    } else if (
      typeof valueA === 'object' &&
      valueA !== null &&
      typeof valueB === 'object' &&
      valueB !== null
    ) {
      // 再帰的にオブジェクトを比較
      const nestedResult = findDifferences({
        beforeData: valueA,
        afterData: valueB,
      })
      if (nestedResult.length > 0) {
        differences.push({ key, differences: nestedResult })
      }
    } else if (valueA !== valueB) {
      // 値が異なる場合
      differences.push({ key, valueA, valueB })
    }
  }

  return {
    length: differences.length, // 差分のプロパティ数
    data: after, // afterData または ComparisonClass 経由で生成されたデータ
  }
}

/****************************************************************************
 * 指定された日付が 'YYYY-MM-DD' 形式であり、かつ有効な日付かどうかをチェックします。
 * - 日付が文字列として正しく指定されていない場合はエラーをスローします。
 * - 'YYYY-MM-DD' 形式に一致しない場合は false を返します。
 * - dayjs でバリデートし、有効な日付であるかを確認します。
 *
 * @param {string} date - チェックする日付（'YYYY-MM-DD' 形式の文字列）。
 * @returns {boolean} - 日付が有効であれば true、無効であれば false を返します。
 * @throws {Error} - date が文字列で指定されていない場合、または日付が未指定の場合にエラーをスローします。
 ****************************************************************************/
export const dateIsValid = (date) => {
  // 引数が指定されていない場合や、文字列でない場合はエラーをスロー
  if (!date || typeof date !== 'string') {
    const message = `[dateIsValid] date は文字列で必ず指定されなければなりません。`
    logger.error(message, { date })
    throw new Error(message)
  }

  // 'YYYY-MM-DD'形式のチェック
  const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
  if (!regex.test(date)) return false

  // dayjsで有効な日付かどうかを確認
  return dayjs(date, 'YYYY-MM-DD', true).isValid()
}

/****************************************************************************
 * Firestoreドキュメントの内容に変更があったかどうかを返します。
 * - updateAt、updateDate、uidを無視し、eventオブジェクトのbeforeとafterを比較します。
 * - さらに、呼び出し元が指定したフィールドも無視します。
 *
 * @param {object} event - onDocumentUpdatedトリガーのイベントオブジェクト
 * @param {array} [ignoreFields=[]] - 無視するフィールド名の配列（任意）
 * @returns {boolean} - ドキュメントが変更されたかどうか
 *
 * @author shisyamo4131
 * @version 1.1.0
 *
 * @updates
 * - version 1.1.0 - 2024-09-23 - 無視するフィールドを指定可能に改修
 * - version 1.0.0 - 2024-07-10 - 初版作成
 ****************************************************************************/
export const isDocumentChanged = (event, ignoreFields = []) => {
  // onDocumentUpdatedトリガーから発生したイベントかどうかをチェックします。
  const before = event?.data?.before?.data() || undefined
  const after = event?.data?.after?.data() || undefined

  if (!before || !after) {
    throw new Error('onDocumentUpdatedのeventオブジェクトが必要です。')
  }

  // updateAt、updateDate、uidと、指定されたフィールドを無視して比較します。
  const omitFields = (data) => {
    const { updateAt, updateDate, uid, ...fields } = data
    // 無視するフィールドを動的に削除
    ignoreFields.forEach((field) => {
      delete fields[field]
    })
    return fields
  }

  const beforeFields = omitFields(before)
  const afterFields = omitFields(after)

  // オブジェクトを文字列に変換して比較
  return JSON.stringify(beforeFields) !== JSON.stringify(afterFields)
}

/**
 * 非正規化されたドキュメントデータを同期させます。
 *
 * 指定されたコレクション内のドキュメントを特定のフィールドで一致するデータと同期します。
 *
 * @param {string} collectionId - 同期対象のコレクションID
 * @param {string} compareProp - 比較対象のフィールド名
 * @param {string} updateProp - 更新対象のフィールド名
 * @param {object} data - 同期するデータオブジェクト（例：{ docId: '123', ... }）
 * @returns {Promise<number>} - 同期されたドキュメントの数
 */
export const syncDependentDocuments = async (
  collectionId,
  compareProp,
  updateProp,
  data
) => {
  const BATCH_SIZE = 500
  logger.info(
    `${collectionId} コレクション内のドキュメントと同期を開始します。`
  )

  if (!collectionId || typeof collectionId !== 'string') {
    throw new TypeError('collectionId は非空の文字列である必要があります。')
  }
  if (!compareProp || typeof compareProp !== 'string') {
    throw new TypeError('compareProp は非空の文字列である必要があります。')
  }
  if (!updateProp || typeof updateProp !== 'string') {
    throw new TypeError('updateProp は非空の文字列である必要があります。')
  }
  if (!data || typeof data !== 'object' || !data.docId) {
    throw new TypeError(
      'data は有効なオブジェクトであり、docId プロパティが必要です。'
    )
  }

  try {
    const colRef = firestore.collection(collectionId)
    const query = colRef.where(compareProp, '==', data.docId)
    const querySnapshot = await query.get()

    if (querySnapshot.empty) {
      logger.info(
        `同期対象のドキュメントはありませんでした: collectionId=${collectionId}, compareProp=${compareProp}, value=${data.docId}`
      )
      return 0 // 一貫性のため 0 を返す
    }

    const docCount = querySnapshot.docs.length
    // logger.info(`${docCount} 件のドキュメントと同期を開始します。`)
    const batchArray = []
    querySnapshot.docs.forEach((doc, index) => {
      if (index % BATCH_SIZE === 0) batchArray.push(firestore.batch())
      batchArray[batchArray.length - 1].update(doc.ref, {
        [updateProp]: data,
      })
    })

    // バッチコミットの実行
    await Promise.all(
      batchArray.map(async (batch, index) => {
        try {
          await batch.commit()
          // logger.info(`バッチ ${index + 1} が正常にコミットされました。`)
        } catch (error) {
          logger.error(`バッチ ${index + 1} のコミットに失敗しました。`, {
            message: error.message,
            stack: error.stack,
          })
          throw error
        }
      })
    )

    logger.info(
      `同期処理が正常に完了しました: コミットされたバッチ数=${batchArray.length}`
    )

    return docCount // 同期されたドキュメント数を返す
  } catch (err) {
    logger.error('syncDependentDocuments でエラーが発生しました。', {
      message: err.message,
      stack: err.stack,
    })
    throw err
  }
}

/**
 * 非正規化されたドキュメントデータを同期させます。
 *
 * 指定されたコレクション内のドキュメントを特定のフィールドで一致するデータと同期します。
 * `updateProp` フィールドが配列である場合、`afterData.docId` と一致する要素を見つけて更新し、
 * 配列でない場合は、該当フィールドを直接上書きします。
 *
 * @param {string} collectionId - 同期対象のコレクションID。
 * @param {string} updateProp - 更新対象のフィールド名。
 * @param {object} afterData - 同期するデータオブジェクト（例：{ docId: '123', ... }）。
 * @param {Array} conditions - クエリ条件を指定するための条件配列（例：[['where', 'props', '==', 'value']]）。
 * @param {number} [batchSize=500] - バッチコミットのサイズ。デフォルトは500。
 *
 * @returns {Promise<number>} - 同期されたドキュメントの数。
 */
export const syncDependentDocumentsV2 = async ({
  collectionId,
  updateProp,
  afterData,
  conditions,
  batchSize = 500, // バッチサイズを外部から指定できるようにする
}) => {
  logger.info(
    `${collectionId} コレクション内のドキュメントと同期を開始します。`
  )

  if (!collectionId || typeof collectionId !== 'string') {
    throw new TypeError('collectionId は非空の文字列である必要があります。')
  }
  if (!updateProp || typeof updateProp !== 'string') {
    throw new TypeError('updateProp は非空の文字列である必要があります。')
  }
  if (!afterData || typeof afterData !== 'object' || !afterData.docId) {
    throw new TypeError(
      'afterData は有効なオブジェクトであり、docId プロパティが必要です。'
    )
  }

  try {
    const colRef = firestore.collection(collectionId)
    let query = colRef
    conditions.forEach((condition) => {
      query = query.where(...condition)
    })
    const querySnapshot = await query.get()

    if (querySnapshot.empty) {
      logger.info(
        `同期対象のドキュメントはありませんでした: collectionId=${collectionId}`
      )
      return 0
    }

    const docCount = querySnapshot.docs.length
    const batchArray = []
    querySnapshot.docs.forEach((doc, index) => {
      if (index % batchSize === 0) batchArray.push(firestore.batch())

      const currentData = doc.data()
      const updateData = {}

      if (Array.isArray(currentData[updateProp])) {
        // updateProp が配列の場合、afterData.docId と一致する要素を置換
        const updatedArray = currentData[updateProp].map((item) =>
          item.docId === afterData.docId ? { ...item, ...afterData } : item
        )

        // 配列に変更があった場合にのみ更新
        if (
          JSON.stringify(updatedArray) !==
          JSON.stringify(currentData[updateProp])
        ) {
          updateData[updateProp] = updatedArray
        }
      } else {
        // updateProp が配列でない場合、そのまま上書き
        updateData[updateProp] = afterData
      }

      if (Object.keys(updateData).length > 0) {
        batchArray[batchArray.length - 1].update(doc.ref, updateData)
      }
    })

    // バッチコミットの実行
    await Promise.all(
      batchArray.map(async (batch, index) => {
        try {
          await batch.commit()
          logger.info(`バッチ ${index + 1} が正常にコミットされました。`)
        } catch (error) {
          logger.error(`バッチ ${index + 1} のコミットに失敗しました。`, {
            message: error.message,
            stack: error.stack,
          })
          throw error
        }
      })
    )

    logger.info(
      `同期処理が正常に完了しました: コミットされたバッチ数=${batchArray.length}`
    )

    return docCount // 同期されたドキュメント数を返す
  } catch (err) {
    logger.error('syncDependentDocuments でエラーが発生しました。', {
      message: err.message,
      stack: err.stack,
    })
    throw err
  }
}

/****************************************************************************
 * 指定されたコレクションのドキュメントを削除します。
 * - comparePropに基づき、docIdと一致するドキュメントを削除します。
 * - BATCH_LIMITごとにFirestoreのバッチ処理を行い、大量のドキュメントも効率的に削除します。
 *
 * @param {Array<string>} collectionIds - 削除対象のコレクションIDの配列
 * @param {string} compareProp - docIdと比較するプロパティの名前
 * @param {string} docId - 削除条件となるドキュメントID
 * @throws {Error} 削除処理中にエラーが発生した場合、エラーをスローします。
 ****************************************************************************/
export const removeDependentDocuments = async (
  collectionIds,
  compareProp,
  docId
) => {
  for (const collectionId of collectionIds) {
    try {
      const colRef = firestore.collection(`${collectionId}`)
      const q = colRef.where(compareProp, '==', docId)
      const snapshots = await q.get()
      const batchArray = []

      // バッチ処理でドキュメントを削除
      snapshots.docs.forEach((doc, index) => {
        if (index % BATCH_LIMIT === 0) batchArray.push(firestore.batch())
        batchArray[batchArray.length - 1].delete(doc.ref)
      })

      // すべてのバッチをコミットして削除を実行
      await Promise.all(batchArray.map((batch) => batch.commit()))

      // 削除成功のログを出力
      logger.info(
        `Documents in ${collectionId} deleted successfully for docId: ${docId}.`
      )
    } catch (err) {
      // エラーログを出力
      logger.error(
        `Error deleting documents in ${collectionId} for docId: ${docId}.`,
        err
      )
      throw err // エラーを呼び出し元に再スロー
    }
  }
}
