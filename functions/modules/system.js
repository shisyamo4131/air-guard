import { onSchedule } from 'firebase-functions/scheduler'
import { logger } from 'firebase-functions/v2'
import dayjs from 'dayjs'
import System from '../models/System.js'
import { EmployeeSiteHistory } from '../models/EmployeeSiteHistory.js'
import { SiteEmployeeHistory } from '../models/SiteEmployeeHistory.js'
import Placement from '../models/Placement.js'

const PLACEMENTS_KEEP_DAYS = 7

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
      logger.log(`[runDailyTask] 不要な配置情報データを削除します。`)
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
