/*****************************************************************************
 * カスタムクラス定義: 現場稼働予定 - SiteOperationSchedule -
 *
 * @author shisyamo4131
 * @refact 2025-02-06
 *****************************************************************************/
import FireModel from './FireModel.js'
import { generateProps } from './propsDefinition/propsUtil.js'
import { SiteMinimal } from './Site.js'

/**
 * PROPERTIES
 */
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 日付
  date: { type: String, default: '', required: false, requiredByClass: true },

  /**
   * スケジュールの一括登録で使用するプロパティ。
   */
  dates: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },

  // 現場ID
  siteId: { type: String, default: '', required: false, requiredByClass: true },

  // 現場オブジェクト
  site: {
    type: Object,
    default: () => new SiteMinimal(),
    required: false,
  },

  // 勤務区分
  workShift: {
    type: String,
    default: 'day',
    validator: (v) => ['day', 'night'].includes(v),
    required: false,
    requiredByClass: true,
  },

  // 開始時刻
  startTime: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 終了時刻
  endTime: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 必要人数
  requiredWorkers: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: true,
  },

  // 要資格者フラグ
  qualification: {
    type: Boolean,
    default: false,
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

  // 休工フラグ（true で休工）
  isClosed: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
}

const { classProps } = generateProps(propsDefinition)

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class SiteOperationSchedule extends FireModel {
  // FireModel 設定
  static collectionPath = 'SiteOperationSchedules'
  static useAutonumber = false
  static logicalDelete = false
  static classProps = classProps
  static tokenFields = []
  static hasMany = []

  // カスタムクラスマップ
  static customClassMap = { site: SiteMinimal }
}

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class SiteOperationScheduleMinimal extends SiteOperationSchedule {
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
