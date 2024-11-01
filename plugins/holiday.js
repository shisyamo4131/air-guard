/**
 * Nuxt で使用する祝日管理用プラグインです。
 * 国民の祝日APIを利用して祝日データを取得します。
 *
 * 機能詳細:
 * - fetchAndSaveHolidays メソッドを実行すると指定された年の祝日データを Realtime Database に保存します。
 * - isHoliday メソッドは指定された日が祝日稼働かを判断して返します。
 *
 * @author shisyamo4131
 */

import { database } from 'air-firebase'
import { ref, set, get, child } from 'firebase/database'

// 定数: 国民の祝日APIのベースURL
const API_BASE_URL = 'https://holidays-jp.github.io/api/v1'

class Holiday {
  /**
   * コンストラクタ
   * @param {Object} $axios - Nuxt.js の @nuxtjs/axios インスタンス
   */
  constructor($axios) {
    this.axios = $axios
  }

  /**
   * 指定した年の祝日データを国民の祝日APIから取得し、
   * Firebase Realtime Database に保存します。
   * @param {number} year - 祝日データを取得する対象の年
   * @throws {Error} API呼び出しやデータ保存に失敗した場合
   */
  async fetchAndSaveHolidays(year) {
    try {
      const response = await this.axios.$get(
        `${API_BASE_URL}/${year}/date.json`
      )
      const holidays = response

      for (const date in holidays) {
        const [year, month] = date.split('-')
        const holidayRef = ref(
          database,
          `Holidays/${year}/${year}-${month}/${date}`
        )

        // Firebaseに祝日データを保存
        await set(holidayRef, {
          date,
          name: holidays[date],
        })
      }
      // eslint-disable-next-line no-console
      console.log(`Holidays for ${year} have been saved to the database.`)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching or saving holiday data:', error)
      throw new Error('Failed to fetch or save holiday data.')
    }
  }

  /**
   * 指定された日付が祝日かどうかを判定します。
   * 引数が去年、今年、来年に該当する場合はAPIを利用します。
   * @param {string} date - 判定する日付 (YYYY-MM-DD フォーマット)
   * @returns {boolean} - 祝日であれば true, それ以外は false
   * @throws {Error} データベースの読み取りまたはAPI呼び出しに失敗した場合
   */
  async isHoliday(date) {
    try {
      const [year, month] = date.split('-')
      const currentYear = new Date().getFullYear()
      const targetYear = parseInt(year)

      // 去年、今年、来年の場合はAPIを利用
      if (targetYear >= currentYear - 1 && targetYear <= currentYear + 1) {
        const response = await this.axios.$get(
          `${API_BASE_URL}/${targetYear}/date.json`
        )
        if (response[date]) {
          // eslint-disable-next-line no-console
          console.log(`The date ${date} is a holiday: ${response[date]}`)
          return true
        } else {
          // eslint-disable-next-line no-console
          console.log(`The date ${date} is not a holiday.`)
          return false
        }
      }

      // それ以外の場合はFirebaseを利用
      const holidayRef = ref(
        database,
        `Holidays/${year}/${year}-${month}/${date}`
      )
      const snapshot = await get(child(ref(database), holidayRef.key))

      if (snapshot.exists()) {
        // eslint-disable-next-line no-console
        console.log(`The date ${date} is a holiday: ${snapshot.val().name}`)
        return true
      } else {
        // eslint-disable-next-line no-console
        console.log(`The date ${date} is not a holiday.`)
        return false
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error checking holiday status:', error)
      throw new Error('Failed to check holiday status.')
    }
  }
}

// Nuxt.js に `$holiday` としてインジェクト
export default (context, inject) => {
  const holiday = new Holiday(context.$axios)
  inject('holiday', holiday)
}
