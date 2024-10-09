import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js'
import { logger } from 'firebase-functions/v2'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/WorkRegulation.js'
dayjs.extend(isSameOrBefore)

/**
 * WorkRegulationsドキュメントデータモデル【物理削除】
 *
 * - 就業規則を管理するデータモデルです。
 *
 * @author shisyamo4131
 * @version 1.1.0
 * @updates
 * - version 1.1.0 - 2024-10-08 - `hasMany` の設定の誤りを修正
 *                              - `getDefaultAttendanceInRange` を実装。
 * - version 1.0.0 - 2024-09-13 - 初版作成
 */
export default class WorkRegulation extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'WorkRegulations'
  static classProps = classProps
  static hasMany = [
    {
      collection: 'EmployeeContracts',
      field: 'workRegulation.docId',
      condition: '==',
      type: 'collection',
    },
  ]

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    Object.defineProperties(this, {
      /**
       * 所定労働時間
       * - 始業時刻、終業時刻、休憩時間から計算した所定労働時間（分）です。
       */
      scheduledWorkMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          // 始業・終業時刻が無効な場合、0を返す
          if (!this.startTime || !this.endTime) return 0
          const [sHour, sMinute] = this.startTime.split(':')
          const [eHour, eMinute] = this.endTime.split(':')

          // 始業・終業時刻のフォーマットが不正な場合、0を返す
          if (
            sHour === undefined ||
            sMinute === undefined ||
            eHour === undefined ||
            eMinute === undefined
          )
            return 0

          // 始業時刻と終業時刻をdayjsで扱う
          const from = dayjs().hour(Number(sHour)).minute(Number(sMinute))
          const to = dayjs().hour(Number(eHour)).minute(Number(eMinute))
          const diff = to.diff(from, 'minute')

          // 休憩時間を差し引いた所定労働時間を返す
          return diff - (this.breakMinutes || 0)
        },
        set() {
          // setterは使用されないため、何もしない
        },
      },
    })
  }

  /****************************************************************************
   * Retrieves default attendance for each day within the specified date range.
   *
   * This function fetches a document by `docId`, and if the document exists,
   * it generates an object where each day between `from` and `to` is mapped to a day type.
   *
   * @param {string} docId - The ID of the document to fetch.
   * @param {Object} param1 - An object containing the date range.
   * @param {string} param1.from - The start date (YYYY-MM-DD).
   * @param {string} param1.to - The end date (YYYY-MM-DD).
   * @returns {Object} An object with dates as keys and day types as values.
   * @throws {Error} If `docId`, `from`, or `to` are not provided, or if the document does not exist.
   ****************************************************************************/
  static async getDefaultAttendanceInRange(docId, { from, to }) {
    // 必須パラメータが指定されているか確認
    if (!docId || !from || !to) {
      const message = `[getDefaultAttendanceInRange] docId, from, and to are required.`
      logger.error(message, { docId, from, to })
      throw new Error(message)
    }

    // インスタンスを作成し、指定された docId に対応するドキュメントが存在するかを確認
    const instance = new this()
    const isExist = await instance.fetch(docId)
    if (!isExist) {
      const message = `[getDefaultAttendanceInRange] Document not found for docId: ${docId}`
      logger.error(message, { docId })
      throw new Error(message)
    }

    // 日付範囲を dayjs オブジェクトに変換
    const startDate = dayjs(from)
    const endDate = dayjs(to)
    const result = {}

    // 指定された日付範囲内でループを回し、各日付ごとの dayType を設定
    for (
      let currentDate = startDate;
      currentDate.isSameOrBefore(endDate);
      currentDate = currentDate.add(1, 'day')
    ) {
      result[currentDate.format('YYYY-MM-DD')] =
        instance.#getDefaultAttendance(currentDate)
    }

    // 結果オブジェクトを返す
    return result
  }

  /****************************************************************************
   * Calculates and returns the default attendance information for a given date.
   *
   * This method determines the type of day (`dayType`) based on whether the day is
   * a scheduled workday, legal holiday, or non-statutory holiday. Additionally, it checks
   * if the next day is a legal holiday, and returns the number of scheduled work minutes
   * for the current day.
   *
   * Note: This method assumes that the `WorkRegulation` document has already been fetched
   * and that the instance variables such as `scheduledWorkDays`, `legalHoliday`, and
   * `scheduledWorkMinutes` are properly initialized.
   *
   * @param {dayjs.Dayjs} date - The date for which attendance information is being calculated.
   * @returns {Object} An object containing the day type, whether the next day is a legal holiday,
   *                   and the number of scheduled work minutes for the current day.
   * @throws {Error} If the required `WorkRegulation` document is not properly fetched.
   ****************************************************************************/
  #getDefaultAttendance(date) {
    // 曜日に基づく dayType と nextDayType の取得用関数
    const getDayType = (day) =>
      this.scheduledWorkDays.includes(day)
        ? 'scheduled'
        : this.legalHoliday === day
        ? 'legal-holiday'
        : 'non-statutory-holiday'

    // 現在の日付の曜日を取得し、dayType（出勤日、法定休日、その他）を決定
    const dayOfWeek = date.format('ddd').toLowerCase()
    const dayType = getDayType(dayOfWeek)

    // 現在の日が「出勤日」の場合にのみ、出勤予定の作業時間（分）を設定
    const scheduledWorkMinutes =
      dayType === 'scheduled' ? this.scheduledWorkMinutes : 0

    // 次の日の曜日を取得し、次の日の dayType を決定
    const nextdayOfWeek = date.add(1, 'day').format('ddd').toLowerCase()
    const nextDayType = getDayType(nextdayOfWeek)

    // 現在の日付に対する出勤情報を返す
    return {
      dayType, // 現在の日の種類（出勤日、法定休日、非法定休日）
      isNextDayLegalHoliday: nextDayType === 'legal-holiday', // 次の日が法定休日かどうか
      scheduledWorkMinutes, // 出勤日であれば出勤予定の作業時間（分）、それ以外は 0
    }
  }
}
