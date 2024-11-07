import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale.js'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/System.js'
import DailyAttendance from './DailyAttendance.js'
import MonthlyAttendance from './MonthlyAttendance.js'
import DailySale from './DailySale.js'
import SiteBilling from './SiteBilling.js'
import OperationResult from './OperationResult.js'
import { EmployeeWorkHistory } from './EmployeeWorkHistory.js'
const firestore = getFirestore()
dayjs.extend(updateLocale)
dayjs.updateLocale('en', { weekStart: 1 })

/**
 * ## Systems ドキュメントデータモデル
 *
 * - システムの状態を表す Firestore ドキュメントのデータモデルです。
 * - ドキュメントを削除することはないため、 delete メソッドは削除しています。
 *
 * @author shisyamo4131
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
   * super クラスの fromFirestore メソッドをオーバーライドします。
   * - ネストされたオブジェクトプロパティについて特殊な処理を追加します。
   *
   * @param {Object} snapshot Firestore の snapshot オブジェクト
   * @returns
   ****************************************************************************/
  fromFirestore(snapshot) {
    const data = snapshot.data()

    // calcAttendance の特殊処理
    const calcAttendance = {
      error: data?.calcAttendance?.error || null,
      executeStatus: data?.calcAttendance?.executeStatus || null,
      lastExecutedAt: data?.calcAttendance?.lastExecutedAt?.toDate
        ? data.calcAttendance.lastExecutedAt.toDate()
        : null,
      status: data?.calcAttendance?.status || 'ready',
    }

    // calcMonthlySales の特殊処理
    const calcMonthlySales = {
      error: data?.calcMonthlySales?.error || null,
      executeStatus: data?.calcMonthlySales?.executeStatus || null,
      lastExecutedAt: data?.calcMonthlySales?.lastExecutedAt?.toDate
        ? data.calcMonthlySales.lastExecutedAt.toDate()
        : null,
      status: data?.calcMonthlySales?.status || 'ready',
    }

    // calcSiteBillings の特殊処理
    const calcSiteBillings = {
      error: data?.calcSiteBillings?.error || null,
      executeStatus: data?.calcSiteBillings?.executeStatus || null,
      lastExecutedAt: data?.calcSiteBillings?.lastExecutedAt?.toDate
        ? data.calcSiteBillings.lastExecutedAt.toDate()
        : null,
      status: data?.calcSiteBillings?.status || 'ready',
    }

    // calcSiteBillings の特殊処理
    const refreshEmployeeSiteHistory = {
      error: data?.refreshEmployeeSiteHistory?.error || null,
      executeStatus: data?.refreshEmployeeSiteHistory?.executeStatus || null,
      lastExecutedAt: data?.refreshEmployeeSiteHistory?.lastExecutedAt?.toDate
        ? data.refreshEmployeeSiteHistory.lastExecutedAt.toDate()
        : null,
      status: data?.refreshEmployeeSiteHistory?.status || 'ready',
    }
    return {
      ...super.fromFirestore(snapshot),
      calcAttendance,
      calcMonthlySales,
      calcSiteBillings,
      refreshEmployeeSiteHistory,
    }
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
  static async calculateMonthlySales({ month }) {
    // 引数のチェック
    if (!month) {
      const message =
        '[calculateMonthlySales] month の指定（YYYY-MM形式）が必要です。'
      logger.error(message)
      throw new Error(message)
    }

    // 月の形式が正しいかチェック
    const regex = /^\d{4}-(0[1-9]|1[0-2])$/
    if (typeof month !== 'string' || !regex.test(month)) {
      const message = `[calculateMonthlySales] month は 'YYYY-MM' 形式の文字列である必要があります。`
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
          const message = `[calculateMonthlySales] System ドキュメントが見つかりませんでした。`
          logger.error(message)
          return false
        }

        const systemDoc = systemDocSnapshot.data()

        // calcMonthlySales プロパティのチェック
        if (
          !systemDoc?.calcMonthlySales ||
          !systemDoc.calcMonthlySales?.status
        ) {
          const message = `[calculateMonthlySales] System ドキュメントに calcMonthlySales または calcMonthlySales.status プロパティがありません。`
          logger.error(message)
          return false
        }

        // calcMonthlySales.status が 'ready' でない場合は実行中と判断
        if (systemDoc.calcMonthlySales.status !== 'ready') {
          const message = `[calculateMonthlySales] 現在処理中のため、実行できません。`
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

  /****************************************************************************
   * 指定された月の現場請求額集計処理を行います。
   *
   * @param {*} param0
   ****************************************************************************/
  static async calculateSiteBillings({ month }) {
    // 引数のチェック
    if (!month) {
      const message =
        '[calculateSiteBillings] month の指定（YYYY-MM形式）が必要です。'
      logger.error(message)
      throw new Error(message)
    }

    // 月の形式が正しいかチェック
    const regex = /^\d{4}-(0[1-9]|1[0-2])$/
    if (typeof month !== 'string' || !regex.test(month)) {
      const message = `[calculateSiteBillings] month は 'YYYY-MM' 形式の文字列である必要があります。`
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
          const message = `[calculateSiteBillings] System ドキュメントが見つかりませんでした。`
          logger.error(message)
          return false
        }

        const systemDoc = systemDocSnapshot.data()

        // calcSiteBillings プロパティのチェック
        if (
          !systemDoc?.calcSiteBillings ||
          !systemDoc.calcSiteBillings?.status
        ) {
          const message = `[calculateSiteBillings] System ドキュメントに calcSiteBillings または calcSiteBillings.status プロパティがありません。`
          logger.error(message)
          return false
        }

        // calcSiteBillings.status が 'ready' でない場合は実行中と判断
        if (systemDoc.calcSiteBillings.status !== 'ready') {
          const message = `[calculateSiteBillings] 現在処理中のため、実行できません。`
          logger.error(message)
          return false
        }

        // ステータスを 'calculating' に更新
        transaction.update(systemDocRef, {
          'calcSiteBillings.status': 'calculating',
        })
        return true
      })

      if (!fileCheck) {
        throw new Error(
          `[calculateSiteBillings] System ファイルのチェックでエラーが発生しました。`
        )
      }

      const from = dayjs(`${month}-01`).format('YYYY-MM-DD')
      const to = dayjs(`${month}-01`).endOf('month').format('YYYY-MM-DD')

      await SiteBilling.createInRange({ from, to })

      // 処理が完了したら System ドキュメントを 'ready' に更新
      await systemDocRef.update({
        'calcSiteBillings.status': 'ready',
        'calcSiteBillings.lastExecutedAt': new Date(),
        'calcSiteBillings.executeStatus': 'success',
        'calcSiteBillings.error': null,
      })
      logger.info(
        `[calculateSiteBillings] 現場別月間請求額集計処理が正常に完了しました。`
      )
    } catch (error) {
      await systemDocRef.update({
        'calcSiteBillings.status': 'ready',
        'calcSiteBillings.lastExecutedAt': new Date(),
        'calcSiteBillings.executeStatus': 'error',
        'calcSiteBillings.error': error.message,
      })
      const message = `[calculateSiteBillings] 現場別月間請求額集計処理でエラーが発生しました。`
      logger.error(message, { month })
      throw error
    }
  }

  /****************************************************************************
   * 従業員の稼働履歴の更新を行います。
   * - System ドキュメントの refreshEmployeeSiteHistory プロパティを参照し、
   *   lastExecutedAt 以降に作成または更新された稼働実績ドキュメントを抽出します。
   * - 抽出された稼働実績ドキュメントをもとに、従業員の稼働履歴の更新を行います。
   ****************************************************************************/
  static async updateEmployeeSiteHistory() {
    // 処理の実行日時を取得しておく
    const now = new Date() // 必要に応じて `dayjs()` に変更

    // System ドキュメントを取得
    const instance = new this()
    const docRef = firestore
      .collection('Systems')
      .doc('System')
      .withConverter(instance.converter())
    try {
      const docSnapshot = await docRef.get()
      const systemData = docSnapshot.data()?.refreshEmployeeSiteHistory

      // 処理前にstatusがreadyでなければ処理を終了
      if (systemData.status && systemData?.status !== 'ready') {
        logger.info('処理はすでに実行中または完了していません。終了します。')
        return
      }

      // 処理のステータスをexecutingに更新
      await docRef.update({ 'refreshEmployeeSiteHistory.status': 'executing' })

      // 最終実行日時を取得 -> 存在しなければ現在日時
      const lastExecutedAt = systemData?.lastExecutedAt || new Date()

      // 処理実行ログを出力
      const deadline = dayjs(lastExecutedAt)
        .utcOffset(9)
        .format('YYYY-MM-DD HH:mm:ss')
      logger.info(
        `${deadline} 以降に作成または更新された稼働実績ドキュメントを対象に従業員の稼働履歴の更新処理を行います。`
      )

      // 最終実行日時以降に作成または更新された稼働実績ドキュメントを取得
      const operationResultInstance = new OperationResult()
      const createdDocuments = await operationResultInstance.fetchDocs([
        ['where', 'createAt', '>=', lastExecutedAt],
      ])
      const updatedDocuments = await operationResultInstance.fetchDocs([
        ['where', 'updateAt', '>=', lastExecutedAt],
      ])

      // 作成または更新された稼働実績ドキュメントが存在しなければ終了
      if (!createdDocuments.length && !updatedDocuments.length) {
        logger.info(
          `${deadline} 以降に作成または更新された稼働実績は存在しませんでした。処理を終了します。`
        )
        await docRef.update({
          'refreshEmployeeSiteHistory.lastExecutedAt': now,
          'refreshEmployeeSiteHistory.status': 'ready',
          'refreshEmployeeSiteHistory.executeStatus': 'success',
        })
        return // 処理終了を明示
      }

      // 対象の稼働実績ドキュメントから重複を排除
      const targetDocuments = createdDocuments
        .concat(updatedDocuments)
        .reduce((acc, doc) => {
          // 重複ドキュメントを排除するロジックを補足
          if (!acc.some(({ docId }) => docId === doc.docId)) acc.push(doc)
          return acc
        }, [])

      // 対象のドキュメントが存在したことをログに出力
      logger.info(
        `${targetDocuments.length} 件の対象ドキュメントが見つかりました。`,
        { operationResultIds: targetDocuments.map(({ docId }) => docId) }
      )

      // 対象の稼働実績ドキュメントを一つずつ処理
      for (const doc of targetDocuments) {
        for (const employeeId of doc.employeeIds) {
          await EmployeeWorkHistory.update(employeeId, doc.date, doc.siteId)
        }
      }

      // 対象のドキュメントが存在したことをログに出力
      logger.info(`従業員の稼働履歴の更新処理が完了しました。`)

      // システムの最終処理日時を更新
      await docRef.update({
        'refreshEmployeeSiteHistory.lastExecutedAt': now,
        'refreshEmployeeSiteHistory.status': 'ready',
        'refreshEmployeeSiteHistory.executeStatus': 'success',
      })
    } catch (error) {
      // エラーハンドリングの追加
      logger.error('updateEmployeeSiteHistory failed:', { error })
      await docRef.update({
        'refreshEmployeeSiteHistory.status': 'ready',
        'refreshEmployeeSiteHistory.executeStatus': 'error',
        'refreshEmployeeSiteHistory.error': error.message,
      })
      throw error // 必要に応じて再スロー
    }
  }
}
