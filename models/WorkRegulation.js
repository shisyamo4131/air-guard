/*****************************************************************************
 * カスタムクラス定義: 就業規則 - WorkRegulation -
 *
 * @author shisyamo4131
 * @refact 2025-02-14
 *****************************************************************************/
import { FireModel, firestore } from 'air-firebase'
import dayjs from 'dayjs'
import { runTransaction } from 'firebase/firestore'
import { EMPLOYEE_CONTRACT_TYPE } from './constants/employee-contract-types'
import { generateProps } from './propsDefinition/propsUtil'
import { DAY_OF_WEEK } from './constants/day-of-weeks'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 年（YYYY）
  year: { type: String, default: '', required: false, requiredByClass: true },

  // 就業規則名
  name: { type: String, default: '', required: false, requiredByClass: true },

  // 雇用形態
  contractType: {
    type: String,
    default: 'full-time',
    validator: (v) => Object.keys(EMPLOYEE_CONTRACT_TYPE).includes(v),
    required: false,
    requiredByClass: true,
  },

  // 始業時刻
  startTime: {
    type: String,
    default: '08:00',
    required: false,
    requiredByClass: true,
  },

  // 終業時刻
  endTime: {
    type: String,
    default: '17:00',
    required: false,
    requiredByClass: true,
  },

  // 休憩時間（分）
  breakMinutes: {
    type: Number,
    default: 60,
    required: false,
    requiredByClass: true,
  },

  // 所定労働時間（分）
  scheduledWorkMinutes: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: true,
  },

  // 法定休日
  legalHoliday: {
    type: String,
    default: 'sun',
    validator: (v) => Object.keys(DAY_OF_WEEK()).includes(v),
    required: false,
  },

  /**
   * 法定外休日
   * - 法定休日以外の休日を配列で管理します。
   */
  nonStatutoryHolidays: {
    type: Array,
    default: () => ['sat'],
    validator: (v) =>
      v.every((dayOfWeek) => Object.keys(DAY_OF_WEEK()).includes(dayOfWeek)),
    required: false,
  },

  /**
   * その他の休日
   * - 法定休日、法定外休日以外の公休日を配列で管理します。
   */
  otherHolidays: { type: Array, default: () => [], required: false },

  // 月平均所定労働日数
  averageMonthlyScheduledWorkDays: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: true,
  },

  // 所定時間外労働の有無
  hasOvertime: { type: Boolean, default: false, required: false },

  // 休日労働の有無
  hasHolidayWork: { type: Boolean, default: false, required: false },

  // 時間外割増率
  overtimePayRate: {
    type: Number,
    default: 25,
    required: false,
    requiredByClass: true,
  },

  // 休日労働割増率
  holidayPayRate: {
    type: Number,
    default: 35,
    required: false,
    requiredByClass: true,
  },

  // 賞与支給
  bonusEligibility: { type: Boolean, default: true, required: false },

  // 備考
  remarks: { type: String, default: '', required: false },

  // [労働条件通知書] 就業場所（雇い入れ直後）
  initialWorkLocation: { type: String, default: '', required: false },

  // [労働条件通知書] 就業場所（変更の範囲）
  locationChangeScope: { type: String, default: '', required: false },

  // [労働条件通知書] 従事すべき業務の内容（雇い入れ直後）
  initialJob: { type: String, default: '', required: false },

  // [労働条件通知書] 従事すべき業務の内容（変更の範囲）
  jobChangeScope: { type: String, default: '', required: false },

  /**
   * 複製元の就業規則ドキュメントID
   * - 就業規則は複製機能を要実装
   * - 複製後、複製前の就業規則が適用されている雇用契約ドキュメントの就業規則ドキュメントIDを更新するのに使用する。
   */
  sourceDocId: { type: String, default: '', required: false },

  /**
   * 法定休日リスト
   * - 当該就業規則上の法定休日に該当する当該年の日付のリストです。
   * - 特定の日の労働日区分が法定休日であるかどうかを判断するために使用するほか、
   *   翌日が法定休日かどうかを判断するためにも使用します。
   * - 上記を理由に、このリストは翌年1月1日を含みます。
   */
  legalHolidays: { type: Array, default: () => [], required: false },

  /**
   * 法定外休日リスト
   * - 当該就業規則上の法定外休日に該当する当該年の日付のリストです。
   * - 特定の日の労働日区分が法定外休日であるかどうかを判断するために使用します。
   */
  nonStatutoryDays: { type: Array, default: () => [], required: false },
}

const { vueProps, classProps } = generateProps(propsDefinition)
export { vueProps }

/*****************************************************************************
 * ACCESSOR
 *****************************************************************************/
const accessor = {
  /**
   * 月平均所定労働日数を自動計算します。
   */
  averageMonthlyScheduledWorkDays: {
    configurable: true,
    enumerable: true,
    get() {
      if (!this.year) return 0

      let count = 0

      for (let month = 1; month <= 12; month++) {
        const daysInMonth = dayjs(`${this.year}-${month}-01`).daysInMonth()

        for (let day = 1; day <= daysInMonth; day++) {
          const dayOfWeek = dayjs(`${this.year}-${month}-${day}`).day() // 0:日曜, 1:月曜, ..., 6:土曜
          const dayName = Object.keys(DAY_OF_WEEK(0))[dayOfWeek] // ロケール非依存で曜日取得

          if (
            dayName !== this.legalHoliday &&
            !this.nonStatutoryHolidays.includes(dayName)
          ) {
            count++
          }
        }
      }

      return Math.max(0, count - this.otherHolidays.length) / 12 // 負の数にならないように
    },
    set() {},
  },

  /**
   * 所定労働時間（分）を始業時刻、終業時刻、休憩時間から計算します。
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
    set() {},
  },

  /**
   * 法定休日リストを年、法定休日から計算して配列で返します。
   */
  legalHolidays: {
    configurable: true,
    enumerable: true,
    get() {
      if (!this.year) return []
      if (!this.legalHoliday) return []
      const result = []
      let date = dayjs(`${this.year}-01-01`)
      const endDate = date.endOf('year').add(1, 'day')
      while (!date.isAfter(endDate, 'day')) {
        const dayOfWeek = date.format('ddd').toLowerCase()
        if (dayOfWeek === this.legalHoliday)
          result.push(date.format('YYYY-MM-DD'))
        date = date.add(1, 'day')
      }
      return result
    },
    set(v) {},
  },

  /**
   * 法定外休日リストを年、法定外休日から計算して配列で返します。
   */
  nonStatutoryDays: {
    configurable: true,
    enumerable: true,
    get() {
      if (!this.year) return []
      if (!this.nonStatutoryHolidays.length) return []
      const result = []
      let date = dayjs(`${this.year}-01-01`)
      const endDate = date.endOf('year')
      while (!date.isAfter(endDate, 'day')) {
        const dayOfWeek = date.format('ddd').toLowerCase()
        if (this.nonStatutoryHolidays.includes(dayOfWeek))
          result.push(date.format('YYYY-MM-DD'))
        date = date.add(1, 'day')
      }
      return result
    },
    set(v) {},
  },
}

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class WorkRegulation extends FireModel {
  // FireModel 設定
  static collectionPath = 'WorkRegulations'
  static useAutonumber = false
  static logicalDelete = false
  static classProps = classProps
  static tokenFields = []
  static hasMany = [
    {
      collection: 'EmployeeContracts',
      field: 'workRegulationId',
      condition: '==',
      type: 'collection',
    },
  ]

  /**
   * コンストラクタをオーバーライド
   * - accessor を利用
   * @param {Object} item
   */
  constructor(item = {}) {
    super(item)

    // accessor の利用設定
    Object.defineProperties(this, {
      averageMonthlyScheduledWorkDays: accessor.averageMonthlyScheduledWorkDays,
      scheduledWorkMinutes: accessor.scheduledWorkMinutes,
      legalHolidays: accessor.legalHolidays,
      nonStatutoryDays: accessor.nonStatutoryDays,
    })
  }

  /**
   * （多分改修が必要）
   * 指定された年度の就業規則ドキュメントをもとに、翌年度の就業規則ドキュメントを作成します。
   * - 翌年度の就業規則ドキュメントは祝日が初期化されます。
   * - 翌年度の就業規則ドキュメントは複製元である今年度のドキュメントIDを保有します。
   * @param {string} year - 作成元となる就業規則の年度（YYYY 形式）
   * @return {Promise<string>} - 作成された翌年度の年度（YYYY 形式）
   */
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
          const newInstance = new this({
            ...doc,
            sourceDocId: doc.docId,
            year: nextYear,
            holidays: [],
          })
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

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class WorkRegulationMinimal extends WorkRegulation {
  // initialize をオーバーライド
  initialize(item = {}) {
    super.initialize(item)
    delete this.tokenMap
    delete this.remarks
    delete this.createAt
    delete this.updateAt
    delete this.uid
  }

  // 更新系メソッドは使用不可
  create() {
    return Promise.reject(new Error('このクラスの create は使用できません。'))
  }

  update() {
    return Promise.reject(new Error('このクラスの update は使用できません。'))
  }

  delete() {
    return Promise.reject(new Error('このクラスの delete は使用できません。'))
  }

  deleteAll() {
    return Promise.reject(
      new Error('このクラスの deleteAll は使用できません。')
    )
  }

  restore() {
    return Promise.reject(new Error('このクラスの restore は使用できません。'))
  }
}
