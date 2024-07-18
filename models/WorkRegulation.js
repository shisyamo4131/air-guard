/**
 * ### WorkRegulation.js
 *
 * 就業規則のデータモデルです。
 *
 * #### 機能詳細
 * 就業規則では以下の項目を設定します。
 * - 所定労働日
 * - 祝日の取り扱い（祝日を所定労働日として扱うかどうか）
 * - 開始時刻、終了時刻、休憩時間
 * - 時間外労働および休日労働の割増率
 *
 * 月平均所定労働日数は年によって変わるため、サブコレクションで管理します。
 *
 * #### 注意事項
 * 1. 変形労働時間制は考慮していません。
 *    変形労働時間制を採用する場合、所定労働日ごとの始業・終業時刻が必要になるなど、
 *    データモデルのフォーマットが大きく変わります。
 * 2. 就業規則は年ごと、雇用形態ごとに作成して従業員に適用させます。
 *
 * @author shisyamo4131
 * @version 1.0.0 - 2024-07-17
 *
 * @updates
 * - version 1.0.1 - 2024-07-18 - 月平均所定労働日数を追加
 * - version 1.0.0 - 2024-07-17 - 初版作成
 */

import dayjs from 'dayjs'
import FireModel from './FireModel'

const props = {
  props: {
    docId: { type: String, default: '', required: false },
    name: { type: String, default: '', required: false },
    scheduledWorkDays: {
      type: Array,
      default: () => ['mon', 'tue', 'wed', 'thu', 'fri'],
      required: false,
    },
    legalHoliday: {
      type: String,
      default: 'sun',
      validator: (v) =>
        !v || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(v),
      required: false,
    },
    isHolidayWorkDay: { type: Boolean, default: true, required: false },
    startTime: { type: String, default: '08:00', required: false },
    endTime: { type: String, default: '17:00', required: false },
    breakMinutes: { type: Number, default: 60, required: false },
    remarks: { type: String, default: '', required: false },
    scheduledWorkMinutes: { type: Number, default: 0, required: false },
    overtimePayRate: { type: Number, default: 25, required: false },
    holidayPayRate: { type: Number, default: 35, required: false },
    bonusEligibility: { type: Boolean, default: true, required: false },
    averageMonthlyScheduledWorkDays: {
      type: Number,
      default: null,
      required: false,
    },
  },
}
export { props }

export default class WorkRegulation extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
    this.collection = 'WorkRegulation'
    Object.defineProperties(this, {
      /**
       * 所定労働時間
       * - 始業時刻、終業時刻、休憩時間から計算した所定労働時間（分）です。
       */
      scheduledWorkMinutes: {
        enumerable: true,
        get() {
          if (!this.startTime || !this.endTime) return 0
          if (
            this.startTime.split(':').length !== 2 ||
            this.endTime.split(':').length !== 2
          )
            return 0
          const [sHour, sMinute] = this.startTime.split(':')
          const [eHour, eMinute] = this.endTime.split(':')
          const from = dayjs().hour(sHour).minute(sMinute)
          const to = dayjs().hour(eHour).minute(eMinute)
          const diff = to.diff(from, 'minute')
          return diff - (this.breakMinutes || 0)
        },
        set(v) {},
      },
    })
  }

  initialize(item = {}) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }
}
