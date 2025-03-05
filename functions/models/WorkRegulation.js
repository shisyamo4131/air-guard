/*****************************************************************************
 * カスタムクラス定義: 就業規則 - WorkRegulation -
 *
 * @author shisyamo4131
 * @refact 2025-02-15
 *****************************************************************************/
import FireModel from './FireModel.js'
import { generateProps } from './propsDefinition/propsUtil.js'

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
    required: false,
  },

  /**
   * 法定外休日
   * - 法定休日以外の休日を配列で管理します。
   */
  nonStatutoryHolidays: {
    type: Array,
    default: () => ['sat'],
    required: false,
  },

  /**
   * その他の休日
   * - 法定休日、法定外休日以外の公休日を配列で管理します。
   */
  otherHolidays: {
    type: Array,
    default: () => [],
    required: false,
  },

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
  bonusEligibility: {
    type: Boolean,
    default: true,
    required: false,
    requiredByClass: false,
  },

  // 備考
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // [労働条件通知書] 就業場所（雇い入れ直後）
  initialWorkLocation: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // [労働条件通知書] 就業場所（変更の範囲）
  locationChangeScope: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // [労働条件通知書] 従事すべき業務の内容（雇い入れ直後）
  initialJob: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // [労働条件通知書] 従事すべき業務の内容（変更の範囲）
  jobChangeScope: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  /**
   * 複製元の就業規則ドキュメントID
   * - 就業規則は複製機能を要実装
   * - 複製後、複製前の就業規則が適用されている雇用契約ドキュメントの就業規則ドキュメントIDを更新するのに使用する。
   */
  sourceDocId: { type: String, default: '', required: false },

  /*****************
   * 以下、不要になると思われるプロパティ
   *****************/

  // 所定労働日
  // 法定休日、法定外休日を年間カレンダーで指定するため、不要になるはず。
  scheduledWorkDays: {
    type: Array,
    default: () => ['mon', 'tue', 'wed', 'thu', 'fri'],
    required: false,
    requiredByClass: true,
  },

  // 祝日を所定労働日とするか
  // 年間カレンダーを作るため不要になるはず。
  isHolidayWorkDay: {
    type: Boolean,
    default: true,
    required: false,
    requiredByClass: false,
  },

  holidays: { type: Array, default: () => [], required: false },
}

const { classProps } = generateProps(propsDefinition)

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
}

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class WorkRegulationMinimal extends WorkRegulation {
  // initialize をオーバーライド
  initialize(item = {}) {
    super.initialize(item)
    delete this.createAt
    delete this.updateAt
    delete this.uid
    delete this.remarks
    delete this.tokenMap
  }

  // 更新系メソッドは使用不可
  create() {
    return Promise.reject(new Error('このクラスの create は使用できません。'))
  }

  // 更新系メソッドは使用不可
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
