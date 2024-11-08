import { onSchedule } from 'firebase-functions/scheduler'
import { logger } from 'firebase-functions/v2'

/**
 * 2024-11-07
 * Pub/Sub のスケジュールタスクの実行を確認するためのテストモジュール
 */

// 毎日 0 時に実行される Cloud Function
export const runDailyTask = onSchedule(
  {
    schedule: 'every day 00:00',
    timeZone: 'Asia/Tokyo', // JST タイムゾーンを指定
  },
  (context) => {
    logger.log('Scheduled function triggered at 0:00 JST')
    try {
      logger.log('Function executed successfully.')
    } catch (error) {
      logger.error('Error executing scheduled function:', error)
    }
  }
)
