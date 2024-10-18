import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/System.js'
import DailyAttendance from './DailyAttendance.js'
import MonthlyAttendance from './MonthlyAttendance.js'
import DailySale from './DailySale.js'
const firestore = getFirestore()
dayjs.extend(updateLocale)
dayjs.updateLocale('en', { weekStart: 1 })

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
   * - 引数 date が指定された場合、指定日を含む一週間（月～日）までの出勤簿データを作成・更新します。
   *
   * @param {Object} param0 - 入力パラメータ。
   * @param {string} param0.month - 処理対象の月（YYYY-MM 形式）。
   * @param {string} param0.employeeId - 処理対象の従業員ID（任意）。
   * @param {string} param0.date - 処理対象の日（任意: YYYY-MM-DD 形式）。
   ****************************************************************************/
  static async calculateMonthlyAttendances({
    month = null,
    employeeId = null,
    date = null,
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

      /**
       * 日付範囲を決定
       * - date が指定されている場合は date を含む一週間（月～日）
       * - date が指定されていない場合は from, to を month から拡張
       *   -> from は月初から月曜日まで遡る
       *   -> to は月末から日曜日まで遡る
       */
      const from = date
        ? dayjs(date).startOf('week').format('YYYY-MM-DD')
        : dayjs(`${month}-01`).startOf('week').format('YYYY-MM-DD')
      const to = date
        ? dayjs(date).endOf('week').format('YYYY-MM-DD')
        : dayjs(`${month}-01`).endOf('month').endOf('week').format('YYYY-MM-DD')

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

  /****************************************************************************
   * 指定された月の月間売上集計処理を行います。
   *
   * NOTE:
   * - 現在は日別売上の集計処理を行うのみ。修正予定。
   *
   * @param {*} param0
   ****************************************************************************/
  static async calculateMontlySales({ month }) {
    // 引数のチェック
    if (!month) {
      const message =
        '[calculateMontlySales] month の指定（YYYY-MM形式）が必要です。'
      logger.error(message)
      throw new Error(message)
    }

    // 月の形式が正しいかチェック
    const regex = /^\d{4}-(0[1-9]|1[0-2])$/
    if (typeof month !== 'string' || !regex.test(month)) {
      const message = `[calculateMontlySales] month は 'YYYY-MM' 形式の文字列である必要があります。`
      logger.error(message, { month })
      throw new Error(message)
    }

    // System ドキュメントへの参照を取得
    const systemInstance = new this()
    const systemDocRef = firestore
      .collection('Systems')
      .doc('System')
      .withConverter(systemInstance.converter())

    try {
      // トランザクションで System ドキュメントをチェック
      const fileCheck = await firestore.runTransaction(async (transaction) => {
        const systemDocSnapshot = await transaction.get(systemDocRef)

        // System ドキュメントが存在するか確認
        if (!systemDocSnapshot.exists) {
          const message = `[calculateMontlySales] System ドキュメントが見つかりませんでした。`
          logger.error(message)
          return false
        }

        const systemDoc = systemDocSnapshot.data()

        // calcMonthlySales プロパティのチェック
        if (
          !systemDoc?.calcMonthlySales ||
          !systemDoc.calcMonthlySales?.status
        ) {
          const message = `[calculateMontlySales] System ドキュメントに calcMonthlySales または calcMonthlySales.status プロパティがありません。`
          logger.error(message)
          return false
        }

        // calcMonthlySales.status が 'ready' でない場合は実行中と判断
        if (systemDoc.calcMonthlySales.status !== 'ready') {
          const message = `[calculateMontlySales] 現在処理中のため、実行できません。`
          logger.error(message)
          return false
        }

        // ステータスを 'calculating' に更新
        transaction.update(systemDocRef, {
          'calcMonthlySales.status': 'calculating',
        })
        return true
      })

      if (!fileCheck) {
        throw new Error(
          `[calculateMonthlySales] System ファイルのチェックでエラーが発生しました。`
        )
      }

      const from = dayjs(`${month}-01`).format('YYYY-MM-DD')
      const to = dayjs(`${month}-01`).endOf('month').format('YYYY-MM-DD')

      await DailySale.createInRange({ from, to })

      // 処理が完了したら System ドキュメントを 'ready' に更新
      await systemDocRef.update({
        'calcMonthlySales.status': 'ready',
        'calcMonthlySales.lastExecutedAt': new Date(),
        'calcMonthlySales.executeStatus': 'success',
        'calcMonthlySales.error': null,
      })
      logger.info(
        `[calculateMonthlySales] 月間売上集計処理が正常に完了しました。`
      )
    } catch (error) {
      await systemDocRef.update({
        'calcMonthlySales.status': 'ready',
        'calcMonthlySales.lastExecutedAt': new Date(),
        'calcMonthlySales.executeStatus': 'error',
        'calcMonthlySales.error': error.message,
      })
      const message = `[calculateMonthlySales] 月間売上集計処理でエラーが発生しました。`
      logger.error(message, { month })
      throw error
    }
  }
}
