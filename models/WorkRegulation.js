import { FireModel, firestore } from 'air-firebase'
import dayjs from 'dayjs'
import { runTransaction } from 'firebase/firestore'
import { accessor, classProps } from './propsDefinition/WorkRegulation'

/**
 * 就業規則を管理するデータモデルです。
 * @author shisyamo4131
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
      scheduledWorkMinutes: accessor.scheduledWorkMinutes,
    })
  }

  /****************************************************************************
   * 週所定労働日数を返します。
   ****************************************************************************/
  get scheduledWorkDaysCount() {
    return this.scheduledWorkDays.length
  }

  /****************************************************************************
   * 所定労働時間（時間）を返します。
   ****************************************************************************/
  get scheduledWorkHoursPerDay() {
    const scheduledWorkMinutes = this.scheduledWorkMinutes ?? 0
    const MINUTES_PER_HOUR = 60
    return scheduledWorkMinutes / MINUTES_PER_HOUR
  }

  /****************************************************************************
   * 週所定労働時間（時間）を返します。
   ****************************************************************************/
  get scheduledWorkHoursPerWeek() {
    return this.scheduledWorkHoursPerDay * this.scheduledWorkDaysCount
  }

  /****************************************************************************
   * beforeCreate をオーバーライドします。
   * - isHolidayWorkDay が true の場合 holidays を初期化します。
   * @returns Promise
   ****************************************************************************/
  beforeCreate() {
    return new Promise((resolve) => {
      if (this.isHolidayWorkDay) this.holidays.splice(0)
      resolve()
    })
  }

  /****************************************************************************
   * beforeUpdate をオーバーライドします。
   * - isHolidayWorkDay が true の場合 holidays を初期化します。
   * @returns Promise
   ****************************************************************************/
  beforeUpdate() {
    return new Promise((resolve) => {
      if (this.isHolidayWorkDay) this.holidays.splice(0)
      resolve()
    })
  }

  /****************************************************************************
   * 指定された年度の就業規則ドキュメントをもとに、翌年度の就業規則ドキュメントを作成します。
   * @param {string} year - 作成元となる就業規則の年度（YYYY 形式）
   * @return {string} - 作成された翌年度の年度（YYYY 形式）
   ****************************************************************************/
  static async createNextYear(year) {
    if (!year || typeof year !== 'string' || !/^\d{4}$/.test(year)) {
      throw new TypeError(`年度を "YYYY" の形式で文字列で指定してください。`)
    }

    try {
      const nextYear = dayjs(`${year}-01-01`).add(1, 'year').format('YYYY')
      const instance = new this()

      // 翌年度のドキュメントを取得し、既に存在しているか確認
      const nextYearDocs = await instance.fetchDocs([
        ['where', 'year', '==', nextYear],
      ])
      if (nextYearDocs.length) {
        throw new Error(`翌年度(${nextYear})の就業規則が既に存在しています。`)
      }

      // 現在の年度のドキュメントを取得し、存在するか確認
      const currentYearDocs = await instance.fetchDocs([
        ['where', 'year', '==', year],
      ])
      if (!currentYearDocs.length) {
        throw new Error(`指定された年度(${year})の就業規則が存在しません。`)
      }

      // トランザクションを使って翌年度のドキュメントを作成
      await runTransaction(firestore, (transaction) => {
        const promises = currentYearDocs.map((doc) => {
          const newInstance = new this({ ...doc, year: nextYear, holidays: [] })
          return newInstance.create({ transaction }) // Promiseを返すようにする
        })

        // すべてのドキュメントの作成が完了するPromiseを返す
        return Promise.all(promises)
      })

      // eslint-disable-next-line no-console
      console.info(`翌年度(${nextYear})の就業規則が正常に作成されました。`)

      return nextYear
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        `createNextYear(${year}) 処理中にエラーが発生しました。`,
        error
      )
      throw error
    }
  }
}

/**
 * WorkRegulation クラスからカスタムクラス用に不要なプロパティを削除したクラスです。
 */
export class WorkRegulationMinimal extends WorkRegulation {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.createAt
    delete this.updateAt
    delete this.remarks
    delete this.tokenMap
  }
}
