/*****************************************************************************
 * カスタムクラス定義: 年間カレンダー - YearlyCalendar -
 * - Realtime Database で年間カレンダーデータを管理するためのクラスです。
 * @author shisyamo4131
 * @refact 2025-02-16
 *****************************************************************************/
import dayjs from 'dayjs'
import { ref, set, update } from 'firebase/database'
import { database } from 'air-firebase'
import { DAY_OF_WEEK } from './constants/day-of-weeks'

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class YearlyCalendar {
  /**
   * @param {Object} params
   * @param {string} params.workRegulationId - 就業規則ドキュメントID
   * @param {string} params.year - 管理する年
   */
  constructor({ workRegulationId, year } = {}) {
    if (!workRegulationId || !year) {
      throw new Error(
        `[YearlyCalendar.js] workRegulationId, year を指定してください。`
      )
    }
    this.workRegulationId = workRegulationId
    this.year = year
  }

  /**
   * ルートノードへの参照パスを返します。
   */
  get dbPath() {
    if (!this.workRegulationId || !this.year) return null
    return `YearlyCalendars/${this.year}/${this.workRegulationId}`
  }

  /**
   * 就業規則に基づいた年間カレンダーを Realtime Database に作成します。
   * - 既存のカレンダーがあった場合はすべて上書きされます。
   * @param {Object} params
   * @param {string} params.legalHoliday - 法定休日とする曜日です。[sun, mon, tue, wed, thu, fri, sat]
   * @param {Array<string>} params.nonStatutoryHolidays - 法定外休日とする曜日の配列です。
   * @param {Array<string>} params.otherHolidays - その他の公休日とする日（YYYY-MM-DD）の配列です。
   */
  async create({ legalHoliday, nonStatutoryHolidays, otherHolidays } = {}) {
    if (!this.workRegulationId) {
      throw new Error(
        `[YearlyCalendar.js - create] workRegulationId が指定されていません。`
      )
    }

    // 年が指定されていなければエラー
    if (!this.year) {
      throw new Error(
        `[YearlyCalendar.js - create] year が指定されていません。workRegulationId: ${this.workRegulationId}`
      )
    }

    // 法定休日の指定を確認
    if (!legalHoliday || !Object.keys(DAY_OF_WEEK()).includes(legalHoliday)) {
      throw new Error(
        `[YearlyCalendar.js - create] legalHoliday が指定されていないか、不正な値が指定されています。workRegulationId: ${this.workRegulationId}, legalHoliday: ${legalHoliday}`
      )
    }

    // 法定外休日の指定を確認
    if (!nonStatutoryHolidays || !Array.isArray(nonStatutoryHolidays)) {
      throw new Error(
        `[YearlyCalendar.js - create] nonStatutoryHolidays が指定されていないか、不正な値が指定されています。workRegulationId: ${this.workRegulationId}, nonStatutoryHolidays: ${nonStatutoryHolidays}`
      )
    }

    const calendar = {}

    try {
      // ロケール依存を回避するために曜日のリストを用意
      const weekDays = Object.keys(DAY_OF_WEEK()) // ["sun", "mon", ..., "sat"]

      // 年初から翌年の年初までの日付を用意（12月31日の isNextDayLegalHoliday を取得するため）
      let date = dayjs(`${this.year}-01-01`)
      const endDate = date.endOf('year').add(1, 'day')

      // すべての日をループして年間カレンダーオブジェクトを生成
      while (!date.isAfter(endDate, 'day')) {
        const formattedDate = date.format('YYYY-MM-DD')
        const dayOfWeek = weekDays[date.day()]
        let type = 'scheduled'
        if (dayOfWeek === legalHoliday) {
          type = 'legal-holiday'
        } else if (nonStatutoryHolidays.includes(dayOfWeek)) {
          type = 'non-statutory-holiday'
        } else if (otherHolidays.includes(formattedDate)) {
          type = 'non-statutory-holiday'
        }

        calendar[formattedDate] = {
          date: formattedDate,
          type,
          isNextDayLegalHoliday: false,
        }
        date = date.add(1, 'day')
      }

      // 生成した年間カレンダーのそれぞれの日について isNextDayLegalHoliday を更新
      // isNextDayLegalHoliday を設定（1月1日から12月31日までを対象）
      const dates = Object.keys(calendar).sort()
      for (let i = 0; i < dates.length - 1; i++) {
        const currentDate = dates[i]
        const nextDate = dates[i + 1]
        if (calendar[nextDate]?.type === 'legal-holiday') {
          calendar[currentDate].isNextDayLegalHoliday = true
        }
      }

      // 翌年の1月1日を削除
      delete calendar[endDate.format('YYYY-MM-DD')]

      // 日ごとのカレンダーを書き込み
      await set(ref(database, `${this.dbPath}/daily`), calendar)

      // 月ごとの所定労働日数を集計
      const scheduledWorkDays = Object.keys(calendar).reduce((sum, key) => {
        const month = key.slice(0, 7)
        if (!sum[month]) sum[month] = 0
        if (calendar[key].type === 'scheduled') sum[month]++
        return sum
      }, {})

      // 月ごとの所定労働日数について updates を用意
      const updates = Object.keys(scheduledWorkDays).reduce((sum, month) => {
        sum[`${this.dbPath}/monthly/${month}`] = {
          scheduledWorkDays: scheduledWorkDays[month],
        }
        return sum
      }, {})

      // 月ごとの所定労働日数を書き込み
      await update(ref(database), updates)

      // 年間休日数をカウント
      const holidays = Object.keys(calendar).reduce((sum, key) => {
        if (calendar[key].type !== 'scheduled') {
          sum = sum + 1
        }
        return sum
      }, 0)

      // 月平均所定労働日数を計算
      const averageMonthlyScheduledWorkDays =
        (Object.keys(calendar).length - holidays) / 12

      // 年間データを書き込み
      await set(ref(database, `${this.dbPath}/yearly`), {
        holidays,
        averageMonthlyScheduledWorkDays,
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        `[YearlyCalendar.js - create] 不明なエラーが発生しました。`,
        err
      )
      throw err
    }
  }

  /**
   * 就業規則にもとづいて作成された年間カレンダーを Realtime Database から削除します。
   */
  async delete() {
    if (!this.workRegulationId) {
      throw new Error(
        `[YearlyCalendar.js - create] workRegulationId が指定されていません。`
      )
    }

    // 年が指定されていなければエラー
    if (!this.year) {
      throw new Error(
        `[YearlyCalendar.js - create] year が指定されていません。workRegulationId: ${this.workRegulationId}`
      )
    }

    try {
      await database.ref(this.dbPath).remove()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        `[YearlyCalendar.js - delete] 不明なエラーが発生しました。`,
        err
      )
      throw err
    }
  }
}
