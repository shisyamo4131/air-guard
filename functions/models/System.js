import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import dayjs from 'dayjs'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/System.js'
import DailyAttendance from './DailyAttendance.js'
import MonthlyAttendance from './MonthlyAttendance.js'
const firestore = getFirestore()

/**
 * ## Systems ドキュメントデータモデル
 *
 * - システムの状態を表す Firestore ドキュメントのデータモデルです。
 * - ドキュメントを削除することはないため、 delete メソッドは削除しています。
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-15 - 初版作成
 */
export default class System extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Systems'
  static classProps = classProps

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.delete
  }

  /****************************************************************************
   * 引数 month で指定された年月の出勤簿を更新作成します。
   * - 処理前、System ドキュメントの calculateAttendance.status が ready でない場合は エラーログを出力して終了します。
   * - 処理前、System ドキュメントの calculateAttendance.status が calculating に更新されます。
   * - DailyAttendance.createInRange、DailyAttendance.updateWeeklyAttendance、
   *   MonthlyAttendance.createInRange を内部で実行します。
   * - エラーが発生した場合、エラーログは出力されますが、エラーはスローされません。
   * - 処理に成功すると System ドキュメントの calculateAttendance プロパティが成功の状態で更新されます。
   * - 処理に失敗すると System ドキュメントの calculateAttendance プロパティが失敗の状態で更新されます。
   *
   * @param {Object} param0 - 入力パラメータ。
   * @param {string} param0.month - 処理対象の月（YYYY-MM 形式）。
   * @param {string} param0.employeeId - 処理対象の従業員ID（任意）。
   ****************************************************************************/
  static async calculateMonthlyAttendances({
    month = null,
    employeeId = null,
  } = {}) {
    // 引数のチェック
    if (!month) {
      const message =
        '[calculateMonthlyAttendances] month の指定（YYYY-MM形式）が必要です。'
      logger.error(message)
      return
    }

    // 月の形式が正しいかチェック
    const regex = /^\d{4}-(0[1-9]|1[0-2])$/
    if (typeof month !== 'string' || !regex.test(month)) {
      const message = `[calculateMonthlyAttendances] month は 'YYYY-MM' 形式の文字列である必要があります。`
      logger.error(message, { month })
      return
    }

    // System ドキュメントへの参照を取得
    const systemDocRef = firestore.collection('Systems').doc('System')

    try {
      // トランザクションで System ドキュメントをチェック
      const fileCheck = await firestore.runTransaction(async (transaction) => {
        const systemDocSnapshot = await transaction.get(systemDocRef)

        // System ドキュメントが存在するか確認
        if (!systemDocSnapshot.exists) {
          const message = `[calculateMonthlyAttendances] System ドキュメントが見つかりませんでした。`
          logger.error(message)
          return false
        }

        const systemDoc = systemDocSnapshot.data()

        // calcAttendance プロパティのチェック
        if (!systemDoc?.calcAttendance || !systemDoc.calcAttendance?.status) {
          const message = `[calculateMonthlyAttendances] System ドキュメントに calcAttendance または calcAttendance.status プロパティがありません。`
          logger.error(message)
          return false
        }

        // calcAttendance.status が 'ready' でない場合は実行中と判断
        if (systemDoc.calcAttendance.status !== 'ready') {
          const message = `[calculateMonthlyAttendances] 現在処理中のため、実行できません。`
          logger.error(message)
          return false
        }

        // ステータスを 'calculating' に更新
        transaction.update(systemDocRef, {
          'calcAttendance.status': 'calculating',
        })
        return true
      })

      if (!fileCheck) return

      // 日付範囲を決定
      const from = dayjs(`${month}-01`).format('YYYY-MM-DD')
      const to = dayjs(`${month}-01`).endOf('month').format('YYYY-MM-DD')

      // DailyAttendance.createInRange を実行
      logger.info(
        `[calculateMonthlyAttendances] DailyAttendance.createInRange を実行します。期間: ${from} - ${to}${
          employeeId ? `、従業員ID: ${employeeId}` : ''
        }`
      )
      await DailyAttendance.createInRange({ from, to, employeeId })

      // DailyAttendance.updateWeeklyAttendance を実行
      logger.info(
        `[calculateMonthlyAttendances] DailyAttendance.updateWeeklyAttendance を実行します。期間: ${from} - ${to}${
          employeeId ? `、従業員ID: ${employeeId}` : ''
        }`
      )
      await DailyAttendance.updateWeeklyAttendance({ from, to, employeeId })

      // MonthlyAttendance.createInRange を実行
      logger.info(
        `[calculateMonthlyAttendances] MonthlyAttendance.createInRange を実行します。month: ${month}${
          employeeId ? `、従業員ID: ${employeeId}` : ''
        }`
      )
      await MonthlyAttendance.createInRange({ month, employeeId })

      // 処理が完了したら System ドキュメントを 'ready' に更新
      await systemDocRef.update({
        'calcAttendance.status': 'ready',
        'calcAttendance.lastExecutedAt': new Date(),
        'calcAttendance.executeStatus': 'success',
        'calcAttendance.error': null,
      })
    } catch (error) {
      // エラーハンドリング時も System ドキュメントを 'ready' に更新
      await systemDocRef.update({
        'calcAttendance.status': 'ready',
        'calcAttendance.lastExecutedAt': new Date(),
        'calcAttendance.executeStatus': 'error',
        'calcAttendance.error': error.message, // エラーの詳細を保存
      })

      // エラーログを出力
      const message =
        '[calculateMonthlyAttendances] 出勤簿の更新処理でエラーが発生しました。'
      logger.error(message, { error })
    }
  }
}
