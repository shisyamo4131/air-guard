import { onSchedule } from 'firebase-functions/scheduler'
import { logger } from 'firebase-functions/v2'
import dayjs from 'dayjs'
import { getFirestore } from 'firebase-admin/firestore'
import System from '../models/System.js'
import { EmployeeSiteHistory } from '../models/EmployeeSiteHistory.js'
import { SiteEmployeeHistory } from '../models/SiteEmployeeHistory.js'
import Placement from '../models/Placement.js'
import Employee from '../models/Employee.js'
import { fetchCoordinates } from './utils/geocoding.js'

const firestore = getFirestore()

// 配置管理情報の保存期間（日）
const PLACEMENTS_KEEP_DAYS = 7

// 現場稼働予定ドキュメントの保存期間（日）
const SITE_OPERATION_SCHEDULES_KEEP_DAYS = 90

/**
 * 空更新の設定
 * { collectionId: 'Employees', UseClass: Employee, maxCount: 10 }
 */
const CLASSES = [
  { collectionId: 'Employees', UseClass: Employee, maxCount: 20 },
]

// 毎日 0 時に実行される Cloud Function
export const runDailyTask = onSchedule(
  {
    schedule: 'every day 00:00',
    timeZone: 'Asia/Tokyo', // JST タイムゾーンを指定
  },
  async (context) => {
    logger.log('[runDailyTask] スケジュールされた日時タスクを実行します。')
    try {
      logger.log(`[runDailyTask] 従業員の現場履歴を更新します。`)
      await updateEmployeeSiteHistory()
      logger.log(`[runDailyTask] 従業員の現場履歴が更新されました。`)

      logger.log(`[runDailyTask] 現場の従業員入場履歴を更新します。`)
      await updateSiteEmployeeHistory()
      logger.log(`[runDailyTask] 現場の従業員入場履歴が更新されました。`)

      logger.log(`[runDailyTask] 不要な配置情報データを削除します。`)
      await cleanUpPlacements()
      logger.log(`[runDailyTask] 不要な配置情報データを削除しました。`)

      logger.log(
        `[runDailyTask] 保存期間を超過した稼働予定ドキュメントを削除します。`
      )
      await cleanUpSiteOperationSchedules()
      logger.log(
        `[runDailyTask] 保存期間を超過した稼働予定ドキュメントの削除処理が完了しました。`
      )

      logger.log(
        `[runDailyTask] 現場ドキュメントの座標情報補完処理を開始します。`
      )
      await fillMissingSiteLocation()
      logger.log(
        `[runDailyTask] 現場ドキュメントの座標情報補完処理が完了しました。`
      )

      logger.log(`[runDailyTask] クラス定義変更に伴う空更新処理を開始します。`)
      await emptyUpdate()
      logger.log(
        `[runDailyTask] クラス定義変更に伴う空更新処理が完了しました。`
      )
    } catch (error) {
      logger.error('[runDailyTask] Error executing scheduled function:', error)
    }
  }
)

/**
 * 従業員の現場履歴を更新します。
 * - System ドキュメントを取得し、状態をチェックした上で EmployeeSiteHistory を更新。
 * - 実行ステータスが ready でなければ処理を終了します。
 * @returns {Promise<void>}
 */
const updateEmployeeSiteHistory = async () => {
  // 処理の実行日時を取得しておく
  const now = new Date() // 日付操作は必要に応じて dayjs に統一可能

  // System ドキュメントを取得
  const instance = new System()
  await instance.fetch('System')

  try {
    const executeStatus = instance.refreshEmployeeSiteHistory

    // 処理前にstatusがreadyでなければ終了
    if (executeStatus?.status !== 'ready') {
      logger.info(
        '[runDailyTask] 処理はすでに実行中または完了していません。終了します。'
      )
      return
    }

    // 処理のステータスを executing に更新
    await instance.updateToExecute('refreshEmployeeSiteHistory')

    // 最終実行日時を取得 -> 存在しなければ現在日時
    const lastExecutedAt = executeStatus?.lastExecutedAt || now

    // EmployeeSiteHistory クラスの updateByTimestamp を実行
    await EmployeeSiteHistory.updateByTimestamp(lastExecutedAt)

    // システムの最終処理日時を更新
    await instance.updateToSuccess('refreshEmployeeSiteHistory', now)
  } catch (error) {
    // エラーハンドリングの追加
    logger.error('[runDailyTask] updateEmployeeSiteHistory failed:', {
      message: error.message,
      stack: error.stack,
    })
    await instance.updateToError('refreshEmployeeSiteHistory', error.message)
    throw error // 必要に応じて再スロー
  }
}

/**
 * 現場の従業員入場履歴を更新します。
 * - System ドキュメントを取得し、状態をチェックした上で SiteEmployeeHistory を更新。
 * - 実行ステータスが ready でなければ処理を終了します。
 * @returns {Promise<void>}
 */
const updateSiteEmployeeHistory = async () => {
  // 処理の実行日時を取得しておく
  const now = new Date() // 日付操作は必要に応じて dayjs に統一可能

  // System ドキュメントを取得
  const instance = new System()
  await instance.fetch('System')

  try {
    const executeStatus = instance.refreshSiteEmployeeHistory

    // 処理前にstatusがreadyでなければ終了
    if (executeStatus?.status !== 'ready') {
      logger.info(
        '[runDailyTask] 処理はすでに実行中または完了していません。終了します。'
      )
      return
    }

    // 処理のステータスを executing に更新
    await instance.updateToExecute('refreshSiteEmployeeHistory')

    // 最終実行日時を取得 -> 存在しなければ現在日時
    const lastExecutedAt = executeStatus?.lastExecutedAt || now

    // SiteEmployeeHistory クラスの updateByTimestamp を実行
    await SiteEmployeeHistory.updateByTimestamp(lastExecutedAt)

    // システムの最終処理日時を更新
    await instance.updateToSuccess('refreshSiteEmployeeHistory', now)
  } catch (error) {
    // エラーハンドリングの追加
    logger.error('[runDailyTask] updateSiteEmployeeHistory failed:', {
      message: error.message,
      stack: error.stack,
    })
    await instance.updateToError('refreshSiteEmployeeHistory', error.message)
    throw error // 必要に応じて再スロー
  }
}

/**
 * 保存期間を超過した配置管理データを削除します。
 */
const cleanUpPlacements = async () => {
  const deadline = dayjs()
    .subtract(PLACEMENTS_KEEP_DAYS, 'day')
    .utcOffset(9)
    .format('YYYY-MM-DD')
  try {
    await Placement.cleanUp(deadline)
  } catch (error) {
    // エラーハンドリングの追加
    logger.error('[runDailyTask] cleanUpPlacements failed:', {
      message: error.message,
      stack: error.stack,
    })
    throw error // 必要に応じて再スロー
  }
}

/**
 * 保存期間を超過した稼働予定ドキュメントを削除します。
 * - 稼働予定ドキュメントを削除するとCloud Functionsによって削除した履歴がRealtime Databaseに作成されてしまうため
 *   対象のドキュメントを一旦アーカイブドキュメントとして作成し、保存期間+1日を超過したものを削除しています。
 * - Realtime Databaseに保存されている稼働予定ドキュメントのCUD履歴はアーカイブドキュメントの削除トリガーで削除されます。
 */
const cleanUpSiteOperationSchedules = async () => {
  const deadline = dayjs()
    .subtract(SITE_OPERATION_SCHEDULES_KEEP_DAYS, 'day')
    .utcOffset(9)
    .format('YYYY-MM-DD')

  const deadlineArchive = dayjs()
    .subtract(SITE_OPERATION_SCHEDULES_KEEP_DAYS + 1, 'day')
    .utcOffset(9)
    .format('YYYY-MM-DD')

  const BATCH_LIMIT = 300

  // バッチ処理を汎用化
  const processInBatches = async (docs, operation) => {
    const batchArray = docs.reduce((batches, doc, index) => {
      if (index % BATCH_LIMIT === 0) {
        batches.push(firestore.batch())
      }
      const currentBatch = batches[batches.length - 1]
      operation(currentBatch, doc)
      return batches
    }, [])

    await Promise.all(batchArray.map((batch) => batch.commit()))
  }

  // Firestoreからクエリのスナップショットを取得する関数
  const getSnapshot = async (collection, deadline) => {
    const colRef = firestore.collection(collection)
    const queryRef = colRef.where('date', '<', deadline)
    return await queryRef.get()
  }

  try {
    // 1. 保存期間を超過した稼働予定ドキュメントを取得
    const siteOperationSchedulesSnapshot = await getSnapshot(
      'SiteOperationSchedules',
      deadline
    )

    if (siteOperationSchedulesSnapshot.empty) {
      logger.info(
        '[cleanUpSiteOperationSchedules] 保存期間を超過した稼働予定ドキュメントは存在しませんでした。'
      )
      return
    }

    // 2. アーカイブドキュメントの作成
    await processInBatches(
      siteOperationSchedulesSnapshot.docs,
      (batch, doc) => {
        const archiveDocRef = firestore
          .collection('SiteOperationSchedules_archive')
          .doc(doc.id)
        batch.set(archiveDocRef, doc.data())
      }
    )

    // 3. 元の稼働予定ドキュメントを削除
    await processInBatches(
      siteOperationSchedulesSnapshot.docs,
      (batch, doc) => {
        batch.delete(doc.ref)
      }
    )

    // 4. 保存期間を超過したアーカイブドキュメントを取得
    const archiveSnapshot = await getSnapshot(
      'SiteOperationSchedules_archive',
      deadlineArchive
    )

    if (archiveSnapshot.empty) {
      logger.info(
        '[cleanUpSiteOperationSchedules] 保存期間を超過したアーカイブドキュメントは存在しませんでした。'
      )
      return
    }

    // 5. アーカイブドキュメントを削除
    await processInBatches(archiveSnapshot.docs, (batch, doc) => {
      batch.delete(doc.ref)
    })

    logger.info('[cleanUpSiteOperationSchedules] 処理が正常に完了しました。')
  } catch (error) {
    logger.error(
      '[cleanUpSiteOperationSchedules] 処理中にエラーが発生しました。',
      {
        message: error.message,
        stack: error.stack,
      }
    )
    throw error // 必要に応じて再スロー
  }
}

/**
 * 座標情報が欠落している現場ドキュメントの座標情報を補完します。
 * - Geocoding API を使用しているため、一度に補完する最大ドキュメント数は 50 件に制限しています。
 * - location フィールドが null であるものを抽出するため、座標情報が取得できない現場が
 *   補完最大ドキュメント数を超えると、いつまで経っても補完が終わりません。
 * @returns {Promise<void>} - 処理が完了すると解決するプロミス
 */
export const fillMissingSiteLocation = async () => {
  // この処理で読み込む現場ドキュメントの最大数（座標情報が null）
  const FILL_MAX_COUNT = 50

  // バッチ処理の最大処理数
  const BATCH_LIMIT = 100

  try {
    const colRef = firestore.collection('Sites')
    const queryRef = colRef.where('location', '==', null).limit(FILL_MAX_COUNT)
    const snapshot = await queryRef.get()

    if (snapshot.empty) {
      // すべてのドキュメントが更新されたことを示すためにエラーとしてログ出力（意図的）
      logger.info(
        '[fillMissingSiteLocation] 座標情報（location）補完対象の現場ドキュメントは存在しませんでした。'
      )
      return
    }

    // 住所から座標データを並列取得
    const locationUpdates = await Promise.all(
      snapshot.docs.map(async (doc) => {
        try {
          const location = await fetchCoordinates(doc.data().address)
          if (!location) {
            logger.warn(`不正な住所である可能性があります。`, {
              docId: doc.data().docId,
              address: doc.data().address,
            })
          }
          return { docRef: doc.ref, location: location || 'N/A' }
        } catch (err) {
          // 住所の座標取得に失敗した場合はログに警告を出すが処理は継続
          logger.warn(
            `[fillMissingSiteLocation] ${doc.id} の座標取得に失敗しました: ${err.message}`
          )
          return null
        }
      })
    )

    // Firestore バッチ更新
    const batchArray = []
    locationUpdates.forEach((update, index) => {
      if (index % BATCH_LIMIT === 0) batchArray.push(firestore.batch())
      batchArray[batchArray.length - 1].update(update.docRef, {
        location: update.location,
      })
    })
    for (const batch of batchArray) {
      await batch.commit()
    }
  } catch (error) {
    // 予期せぬエラーの発生時にエラーログを記録
    logger.error(
      `[fillMissingSiteLocation] エラーが発生しました: ${error.message}`
    )
  }
}

/**
 * クラスの内容に変更が生じた際、欠落した情報を補完するためにドキュメントの空更新を行うための関数です。
 * @returns
 */
export const emptyUpdate = async () => {
  if (CLASSES.length === 0) {
    logger.info(
      `[emptyUpdate] 空更新を行うべきコレクションは存在しませんでした。`
    )
    return
  }
  const historyDocRef = firestore.collection('EmptyUpdates').doc('EMPTY_UPDATE')
  const historyDocSnapshot = await historyDocRef.get()
  const historyData = historyDocSnapshot.exists ? historyDocSnapshot.data() : {}

  for (const Cls of CLASSES) {
    logger.info(`[emptyUpdate] ${Cls.collectionId} の空更新を行います。`)
    const lastTimeDocId = historyData[Cls.collectionId]
    const instance = new Cls.UseClass()
    const maxCount = Cls.maxCount

    const constraints = lastTimeDocId
      ? [
          ['where', 'docId', '>', lastTimeDocId],
          ['orderBy', 'docId'],
          ['limit', maxCount],
        ]
      : [
          ['orderBy', 'docId'],
          ['limit', maxCount],
        ]

    const docs = await instance.fetchDocs(constraints)

    if (docs.length === 0) {
      logger.info(`No new updates for ${Cls.collectionId}`)
      continue
    }

    for (const doc of docs) {
      await doc.update() // ここでクラスの update メソッドを使用
    }

    // ドキュメントが取得できた場合のみ、lastDocId を更新
    if (docs.length > 0) {
      const lastDocId = docs[docs.length - 1].docId
      await historyDocRef.set(
        { [Cls.collectionId]: lastDocId },
        { merge: true }
      )
    }
    logger.info(`[emptyUpdate] ${Cls.collectionId} を空更新しました。`)
  }
}
