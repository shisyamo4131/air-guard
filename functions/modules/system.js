import { onSchedule } from 'firebase-functions/scheduler'
import { logger } from 'firebase-functions/v2'
import System from '../models/System.js'
import { EmployeeSiteHistory } from '../models/EmployeeSiteHistory.js'

/**
 * 2024-11-07 Pub/Sub のスケジュールタスクの実行を確認するためのテストモジュール
 * 2024-11-08 指定された時刻に実行されたことを確認。
 */

// 毎日 0 時に実行される Cloud Function
export const runDailyTask = onSchedule(
  {
    schedule: 'every day 00:00',
    timeZone: 'Asia/Tokyo', // JST タイムゾーンを指定
  },
  async (context) => {
    logger.log('スケジュールされた日時タスクを実行します。')
    try {
      logger.log(`従業員の現場履歴を更新します。`)
      await updateEmployeeSiteHistory()
      logger.log(`従業員の現場履歴が更新されました。`)
    } catch (error) {
      logger.error('Error executing scheduled function:', error)
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
      logger.info('処理はすでに実行中または完了していません。終了します。')
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
    logger.error('updateEmployeeSiteHistory failed:', {
      message: error.message,
      stack: error.stack,
    })
    await instance.updateToError('refreshEmployeeSiteHistory', error.message)
    throw error // 必要に応じて再スロー
  }
}
