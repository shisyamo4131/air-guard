/**
 * 稼働実績明細のプロパティ定義です。
 * - 従業員、外注先で共有となるプロパティのみ定義しています。
 * - クラスでの使用時は、必ず Accessor.isValid を適用してください。
 * @refact 2025-01-30
 */
import dayjs from 'dayjs'
import { WORK_RESULT } from '../constants/work-results'
import { generateProps } from './propsUtil'

/*****************************************************************************
 * PROPS DEFINITION
 *****************************************************************************/
const propsDefinition = {
  // 勤務日
  date: { type: String, default: '', required: false },

  // 勤務結果
  workResult: {
    type: String,
    default: 'normal',
    required: false,
    validator: (v) => Object.keys(WORK_RESULT).includes(v),
  },

  // 開始時刻
  startTime: { type: String, default: '08:00', required: false },

  // 終了時刻
  endTime: { type: String, default: '17:00', required: false },

  // 翌日終了フラグ
  endAtNextday: { type: Boolean, default: false, required: false },

  // 休憩時間（分）
  breakMinutes: { type: Number, default: 60, required: false },

  // 実働時間（分）
  workMinutes: { type: Number, default: 480, required: false },

  // 残業時間（分）
  overtimeMinutes: { type: Number, default: 0, required: false },

  // 深夜労働時間（分）
  nighttimeMinutes: { type: Number, default: 0, required: false },

  // 資格者フラグ
  qualification: { type: Boolean, default: false, required: false },

  // OJT フラグ
  ojt: { type: Boolean, default: false, required: false },

  /**
   * 所定時間
   * - 当該稼働実績における一日の所定就業時間で、残業時間の算出基準に使用します。
   * - 従業員雇用契約の所定労働時間ではありません。
   */
  scheduledMinutes: { type: Number, default: 480, required: false },

  // 備考
  remarks: { type: String, default: '', required: false },

  // データが従業員であることを表すフラグ
  isEmployee: { type: Boolean, default: false, required: false },

  // データが外注先であることを表すフラグ
  isOutsourcer: { type: Boolean, default: false, required: false },

  /**
   * チェックディジット
   */
  isValid: { type: Boolean, default: false, required: false },
}

const { vueProps, classProps } = generateProps(propsDefinition)

/*****************************************************************************
 * ACCESSOR
 *****************************************************************************/
/**
 * 実働時間を開始時刻、終了時刻から計算して返します。
 * - 勤務日、開始時刻、終了時刻、休憩時間、所定時間が未入力の場合は 0 を返します。
 */
const workMinutes = {
  configurable: true,
  enumerable: true,
  get() {
    // 勤務日、開始時刻、終了時刻が未入力であれば 0 を返す
    if (!this.date) return 0
    if (!this.startTime || !this.endTime) return 0

    // 休憩時間が数値でなければ 0 を返す
    if (typeof this.breakMinutes !== 'number') return 0

    // 所定時間が数値でなければ 0 を返す
    if (typeof this.scheduledMinutes !== 'number') return 0

    // 開始時刻、終了時刻から dayjs オブジェクトを生成
    const from = dayjs(`${this.date} ${this.startTime}`)
    let to = dayjs(`${this.date} ${this.endTime}`)
    if (this.endAtNextday) to = to.add(1, 'day') // 翌日終了フラグによる日の加算

    // 時間差（分）を算出し、休憩時間を差し引く
    const total = to.diff(from, 'minute') - this.breakMinutes

    // 所定時間と計算結果とを比較して小さい方を返す
    return Math.min(this.scheduledMinutes, total)
  },
  set(v) {},
}

/**
 * 残業時間を開始時刻、終了時刻から計算して返します。
 * - 勤務日、開始時刻、終了時刻、休憩時間、所定時間が未入力の場合は 0 を返します。
 */
const overtimeMinutes = {
  configurable: true,
  enumerable: true,
  get() {
    // 勤務日、開始時刻、終了時刻が未入力であれば 0 を返す
    if (!this.date) return 0
    if (!this.startTime || !this.endTime) return 0

    // 休憩時間が数値でなければ 0 を返す
    if (typeof this.breakMinutes !== 'number') return 0

    // 所定時間が数値でなければ 0 を返す
    if (typeof this.scheduledMinutes !== 'number') return 0

    // 開始時刻、終了時刻から dayjs オブジェクトを生成
    const from = dayjs(`${this.date} ${this.startTime}`)
    let to = dayjs(`${this.date} ${this.endTime}`)
    if (this.endAtNextday) to = to.add(1, 'day') // 翌日終了フラグによる日の加算

    // 時間差（分）を算出し、休憩時間を差し引く
    const total = to.diff(from, 'minute') - this.breakMinutes

    // 計算結果から所定時間を差し引き、0 と比較して大きい方を返す。
    return Math.max(0, total - this.scheduledMinutes)
  },
  set(v) {},
}

/**
 * 深夜労働時間を開始時刻、終了時刻から計算して返します。
 * - 勤務日、開始時刻、終了時刻が未入力の場合は 0 を返します。
 * NOTE:
 * - 勤怠実績計算時に算出される
 * - 稼働実績明細情報としてはあまり重要ではない
 * - 休憩時間の取り扱いが不明瞭
 * などを理由に、稼働実績明細では一旦不要と判断して強制的に0を返しています。
 */
const nighttimeMinutes = {
  configurable: true,
  enumerable: true,
  get() {
    // 勤務日、開始時刻、終了時刻が未入力であれば 0 を返す
    if (!this.date) return 0
    if (!this.startTime || !this.endTime) return 0

    return 0
  },
  set(v) {},
}

/**
 * チェックディジットを稼働させるための Accessor です。
 * - 従業員フラグと外注先フラグが一致したら false を返します。
 * - 必須項目が未入力である場合は false を返します。
 * - 終了時刻が開始時刻よりも前の場合 false を返します。
 * - 開始時刻と終了時刻の時間差（分）が実働時間、休憩時間、残業時間の合計と一致しなければ false を返します。
 * - 以上の条件を満たさなければ true を返します。
 */
const isValid = {
  configurable: true,
  enumerable: true,
  get() {
    // 従業員フラグと外注先フラグが一致したら false を返す
    if (this.isEmployee === this.isOutsourcer) return false

    // 勤務日、開始時刻、終了時刻が未入力であれば false を返す
    if (!this.date) return false
    if (!this.startTime || !this.endTime) return false

    // 休憩時間が数値でなければ false を返す
    if (typeof this.breakMinutes !== 'number') return false

    // 所定時間が数値でなければ false を返す
    if (typeof this.scheduledMinutes !== 'number') return false

    // 開始時刻、終了時刻から dayjs オブジェクトを生成
    const from = dayjs(`${this.date} ${this.startTime}`)
    let to = dayjs(`${this.date} ${this.endTime}`)
    if (this.endAtNextday) to = to.add(1, 'day') // 翌日終了フラグによる日の加算

    // 時間差（分）を算出
    const total = to.diff(from, 'minute')

    // 時間差（分）がマイナスであれば false を返す（終了時刻が開始時刻より前）
    if (total < 0) return false

    // 時間差が実働時間、休憩時間、残業時間の合計と一致すれば true を返す
    return total === this.workMinutes + this.breakMinutes + this.overtimeMinutes
  },
  set(v) {},
}

const accessor = {
  workMinutes,
  overtimeMinutes,
  nighttimeMinutes,
  isValid,
}

export { propsDefinition, vueProps, classProps, accessor }
