import { FireModel, firestore } from 'air-firebase'
import { getApp } from 'firebase/app'
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import { doc, runTransaction } from 'firebase/firestore'
import dayjs from 'dayjs'
import { classProps } from './propsDefinition/LeaveRecord'

/**
 * LeaveRecordsドキュメントデータモデル【物理削除】
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-16 - 初版作成
 */
export default class LeaveRecord extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'LeaveRecords'
  static classProps = classProps

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.tokenMap
  }

  /****************************************************************************
   * create メソッドをオーバーライドします。
   * - ドキュメントを作成し、MonthlyAttendance の更新処理を行います。
   ****************************************************************************/
  async create() {
    try {
      const docId = `${this.employeeId}-${this.date}`
      if (this.leaveType === 'substitute') {
        await runTransaction(firestore, async (transaction) => {
          const docRef = doc(
            firestore,
            'DailyAttendances',
            `${this.employeeId}-${this.substituteWorkDate}`
          )
          const docSnapshot = await transaction.get(docRef)
          const substituted = docSnapshot.data()
          if (
            !['non-statutory-holiday', 'legal-holiday'].includes(
              substituted.dayType
            )
          ) {
            const message = `振替対象日は法定外休日、または法定休日である必要があります。振り替えることはできません。`
            // eslint-disable-next-line no-console
            console.error(message, {
              substituteWorkDate: this.substituteWorkDate,
            })
            throw new Error(message)
          }
          if (substituted.totalWorkingMinutes === 0) {
            const message = `振替対象日に出勤実績がありません。振り替えることはできません。`
            // eslint-disable-next-line no-console
            console.error(message, {
              substituteWorkDate: this.substituteWorkDate,
            })
            throw new Error(message)
          }
          this.substitutedDayType = substituted.dayType
          await super.create({ docId, transaction })
        })
      } else {
        await super.create({ docId })
      }
      const month = this.date.slice(0, 7)
      const employeeId = this.employeeId
      const date = this.date
      await LeaveRecord.#refreshMonthlyAttendance({ month, employeeId, date })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        '[create] LeaveRecord ドキュメントの作成処理で不明なエラーが発生しました。',
        err
      )
      throw err
    }
  }

  /****************************************************************************
   * update メソッドをオーバーライドします。
   * - ドキュメントを作成し、MonthlyAttendance の更新処理を行います。
   ****************************************************************************/
  async update() {
    try {
      await super.update()
      const month = this.date.slice(0, 7)
      const employeeId = this.employeeId
      const date = this.date
      await LeaveRecord.#refreshMonthlyAttendance({ month, employeeId, date })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        '[update] LeaveRecord ドキュメントの作成処理で不明なエラーが発生しました。',
        err
      )
      throw err
    }
  }

  /****************************************************************************
   * delete メソッドをオーバーライドします。
   * - ドキュメントを削除し、MonthlyAttendance の更新処理を行います。
   ****************************************************************************/
  async delete() {
    try {
      await super.delete()
      const month = this.date.slice(0, 7)
      const employeeId = this.employeeId
      const date = this.date
      await LeaveRecord.#refreshMonthlyAttendance({ month, employeeId, date })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        '[delete] LeaveRecord ドキュメントの作成処理で不明なエラーが発生しました。',
        err
      )
      throw err
    }
  }

  /****************************************************************************
   * 指定された月の出勤簿を更新するメソッドです。
   * - Firebase Functions の `maintenance-refreshMonthlyAttendances` 関数を呼び出して、出勤簿の更新処理を行います。
   * - 集計対象の出勤簿ドキュメント数を抑制するため、ここでは更新対象日 date が必須となります。
   *   -> 各集計関数は date をオプションで受け取ることができます。
   * - ローカル環境の場合は、Functions エミュレーターに接続します。
   *
   * @param {Object} param0 - 入力パラメータ。
   * @param {string} param0.month - 更新対象の月（YYYY-MM形式、必須）。
   * @param {string} param0.employeeId - 更新対象の従業員ID（必須）。
   * @param {string} param0.date - 更新対象の日付（必須）。
   * @throws {Error} 更新処理中にエラーが発生した場合にスローされます。
   ****************************************************************************/
  static async #refreshMonthlyAttendance({ month, employeeId, date } = {}) {
    // month, employeeId, date が指定されているかチェック
    if (!month || !employeeId || !date) {
      const message =
        '[refreshMonthlyAttendance] month, employeeId, date は必須です。'
      console.error(message) // eslint-disable-line no-console
      throw new Error(message)
    }

    // month が 'YYYY-MM' 形式であるかチェック
    const regexMonth = /^\d{4}-(0[1-9]|1[0-2])$/
    if (typeof month !== 'string' || !regexMonth.test(month)) {
      const message = `[refreshMonthlyAttendance] month は 'YYYY-MM' 形式の文字列である必要があります。`
      console.error(message, { month }) // eslint-disable-line no-console
      throw new Error(message)
    }

    // date が 'YYYY-MM-DD' 形式であり、妥当な日付であるかチェック
    const regexDate = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
    if (
      typeof date !== 'string' ||
      !regexDate.test(date) ||
      !dayjs(date, 'YYYY-MM-DD', true).isValid()
    ) {
      const message = `[refreshMonthlyAttendance] date は 'YYYY-MM-DD' 形式で、妥当な日付である必要があります。`
      console.error(message, { date }) // eslint-disable-line no-console
      throw new Error(message)
    }

    try {
      const firebaseApp = getApp()
      const functions = getFunctions(firebaseApp, 'asia-northeast1')

      // ローカル環境かどうかを判定し、エミュレーターに接続
      if (process.env.NODE_ENV === 'local') {
        connectFunctionsEmulator(functions, 'localhost', 5001)
      }

      // Firebase Functions を呼び出す
      const func = httpsCallable(
        functions,
        'maintenance-refreshMonthlyAttendances'
      )
      const result = await func({ month, employeeId, date })

      // 成功メッセージをコンソールに表示
      console.info(result.data.message) // eslint-disable-line no-console
    } catch (err) {
      const message =
        '[refreshMonthlyAttendance] 出勤簿の更新処理で不明なエラーが発生しました。'
      console.error(message, err) // eslint-disable-line no-console
      throw err // エラーを再スローして呼び出し元に通知
    }
  }

  /****************************************************************************
   * beforeCreate をオーバーライドします。
   ****************************************************************************/
  async beforeCreate() {
    await this.#initPropertiesBeforeSubmit()
  }

  /****************************************************************************
   * beforeUpdate をオーバーライドします。
   ****************************************************************************/
  async beforeUpdate() {
    await this.#initPropertiesBeforeSubmit()
  }

  /****************************************************************************
   * 選択された leaveType に応じて他のプロパティの整合性を合わせます。
   ****************************************************************************/
  #initPropertiesBeforeSubmit() {
    return new Promise((resolve) => {
      switch (this.leaveType) {
        case 'absent':
          this.substituteWorkDate = ''
          this.substitutedDayType = ''
          this.isAnualPaidLeave = false
          this.isPaidLeave = false
          this.leavePaymentRate = 0
          break
        case 'substitute':
          this.isAnualPaidLeave = false
          this.isPaidLeave = false
          this.leavePaymentRate = 0
          break
        case 'compOff':
          this.substituteWorkDate = ''
          this.substitutedDayType = ''
          this.isAnualPaidLeave = false
          this.isPaidLeave = false
          this.leavePaymentRate = 0
          break
        case 'leave':
          this.substituteWorkDate = ''
          this.substitutedDayType = ''
          if (this.isAnualPaidLeave) {
            this.leavePaymentRate = 100
          }
          break
      }
      resolve()
    })
  }
}
