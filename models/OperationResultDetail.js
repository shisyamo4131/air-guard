/**
 * ## OperationResultDetail（稼働実績明細）データモデル
 *
 * - `OperationResultWorker`、`OperationResultOutsourcer` のベースモデルです。
 * - Firestoreドキュメントのデータモデルではないため、FireModelは継承していません。
 * ‐ 開始時刻、終了時刻、休憩時間、所定労働時間が変更されると実働時間と残業時間を自動計算します。
 * - 開始時刻と終了時刻から深夜時間を自動計算します。
 * - 休憩時間が変更されると、実働時間と残業時間が更新されます。
 * - 実働時間が変更されると残業時間が更新されます。
 * - 休憩時間、実働時間、残業時間の合計が開始時刻、終了時刻の時間差と一致しない場合、isValidプロパティがfalseになります。
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.1 - 2024-10-02 - `startTime`、`endTime` の時刻フォーマットに関する警告を出力しないように修正。
 * - version 1.0.0 - 2024-10-01 - 初版作成
 */
export default class OperationResultDetail {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    /**
     * クラスのインスタンスを初期化します。
     * @param {Object} item - 初期化するためのデータを含むオブジェクト
     */
    this.initialize(item)
  }

  /****************************************************************************
   * INITIALIZE
   ****************************************************************************/
  initialize(item = {}) {
    /**
     * プロパティを初期化します。
     * @param {Object} item - 各プロパティの初期値を設定するためのオブジェクト
     */
    this.date = item?.date || ''
    this.workResult = item?.workResult || 'normal'
    this._startTime = item?.startTime || '08:00'
    this._endTime = item?.endTime || '17:00'
    this._endAtNextday = item?.endAtNextday || false
    this._breakMinutes =
      this.#validateMinutes(item?.breakMinutes, 'breakMinutes') ?? 60
    this._workMinutes =
      this.#validateMinutes(item?.workMinutes, 'workMinutes') ?? 480
    this._overtimeMinutes =
      this.#validateMinutes(item?.overtimeMinutes, 'overtimeMinutes') ?? 0
    this._nighttimeMinutes =
      this.#validateMinutes(item?.nighttimeMinutes, 'nighttimeMinutes') ?? 0
    this.qualification = item?.qualification || false
    this.ojt = item?.ojt || false
    this._scheduledWorkMinutes =
      this.#validateMinutes(
        item?.scheduledWorkMinutes,
        'scheduledWorkMinutes'
      ) ?? 480
    this.remarks = item?.remarks || ''

    Object.defineProperties(this, {
      /**
       * 開始時刻
       */
      startTime: {
        get() {
          return this._startTime
        },
        set(value) {
          this._startTime = value
          if (this.#isValidTimeFormat(value)) {
            this.#calculateWorkOvertimeAndNighttime()
          }
          // else {
          //   // eslint-disable-next-line no-console
          //   console.warn(
          //     `Invalid time format for startTime: ${value}. Expected HH:MM format.`
          //   )
          // }
        },
        configurable: true,
        enumerable: true,
      },
      /**
       * 終了時刻
       */
      endTime: {
        get() {
          return this._endTime
        },
        set(value) {
          this._endTime = value
          if (this.#isValidTimeFormat(value)) {
            this.#calculateWorkOvertimeAndNighttime()
          }
          // else {
          //   // eslint-disable-next-line no-console
          //   console.warn(
          //     `Invalid time format for endTime: ${value}. Expected HH:MM format.`
          //   )
          // }
        },
        configurable: true,
        enumerable: true,
      },
      endAtNextday: {
        get() {
          return this._endAtNextday
        },
        set(value) {
          this._endAtNextday = value
          this.#calculateWorkOvertimeAndNighttime()
        },
        configurable: true,
        enumerable: true,
      },
      /**
       * 休憩時間（分）
       */
      breakMinutes: {
        get() {
          return this._breakMinutes
        },
        set(value) {
          this._breakMinutes = value
          if (this.#validateMinutes(value, 'breakMinutes')) {
            this.#calculateWorkOvertimeAndNighttime()
          }
        },
        configurable: true,
        enumerable: true,
      },
      /**
       * 所定労働時間（分）
       */
      scheduledWorkMinutes: {
        get() {
          return this._scheduledWorkMinutes
        },
        set(value) {
          this._scheduledWorkMinutes = value
          if (this.#validateMinutes(value, 'scheduledWorkMinutes')) {
            this.#calculateWorkOvertimeAndNighttime()
          }
        },
        configurable: true,
        enumerable: true,
      },
      /**
       * 実働時間（分）
       */
      workMinutes: {
        get() {
          return this._workMinutes
        },
        set(value) {
          const oldWorkMinutes = this._workMinutes
          this._workMinutes = value
          if (this.#validateMinutes(value, 'workMinutes')) {
            this._overtimeMinutes += oldWorkMinutes - this._workMinutes
          }
        },
        configurable: true,
        enumerable: true,
      },
      /**
       * 残業時間（分）
       */
      overtimeMinutes: {
        get() {
          return this._overtimeMinutes
        },
        set(v) {},
        configurable: true,
        enumerable: true,
      },
      /**
       * 深夜勤務時間（分）
       */
      nighttimeMinutes: {
        get() {
          return this._nighttimeMinutes
        },
        set(v) {},
        configurable: true,
        enumerable: true,
      },
      /**
       * 勤怠実績としてデータの妥当性が保障されているかどうかを表すフラグ
       */
      isValid: {
        get() {
          if (!this.date) return false
          const totalTime =
            this.#convertTimeToMinutes(this._endTime) -
            this.#convertTimeToMinutes(this._startTime)
          const totalMinutes =
            this._breakMinutes + this._workMinutes + this._overtimeMinutes

          return totalTime === totalMinutes
        },
        set(v) {},
        configurable: true,
        enumerable: true,
      },
    })
  }

  /****************************************************************************
   * ADDED PROPERTIES
   ****************************************************************************/
  get workHours() {
    return this._workMinutes / 60
  }

  get breakHours() {
    return this._breakMinutes / 60
  }

  get overtimeHours() {
    return this._overtimeMinutes / 60
  }

  get nighttimeHours() {
    return this._nighttimeMinutes / 60
  }

  /****************************************************************************
   * METHODS
   ****************************************************************************/
  /**
   * 実働時間、残業時間、深夜勤務時間を計算します。
   * 内部のプロパティに結果を反映します。
   */
  #calculateWorkOvertimeAndNighttime() {
    if (!this._startTime || !this._endTime) {
      this._workMinutes = 0
      this._overtimeMinutes = 0
      this._nighttimeMinutes = 0
      return
    }

    const start = this.#convertTimeToMinutes(this._startTime)
    let end = this.#convertTimeToMinutes(this._endTime)

    if (!this._endAtNextday && start > end) {
      this._workMinutes = 0
      this._overtimeMinutes = 0
      this._nighttimeMinutes = 0
      return
    }

    if (this.endAtNextday) {
      end += 1440 // 翌日の時間を加算
    }

    const totalMinutes = end - start
    this._workMinutes = Math.min(
      totalMinutes - this._breakMinutes,
      this._scheduledWorkMinutes
    )
    this._overtimeMinutes = Math.max(
      0,
      totalMinutes - this._breakMinutes - this._scheduledWorkMinutes
    )
    this._nighttimeMinutes = this.#calculateNighttimeMinutes(start, end)
  }

  /**
   * 深夜勤務時間を計算します。
   * @param {number} start - 開始時刻（分単位）
   * @param {number} end - 終了時刻（分単位）
   * @returns {number} - 深夜勤務時間（分）
   */
  #calculateNighttimeMinutes(start, end) {
    const NIGHT_START = 22 * 60 // 22:00 in minutes
    const NIGHT_END = 5 * 60 // 05:00 in minutes

    let nighttimeMinutes = 0

    // 開始時刻が夜間時間にかかる場合（22:00～翌5:00）
    if (start < NIGHT_END) {
      nighttimeMinutes += Math.min(end, NIGHT_END) - start
    }

    // 終了時刻が夜間時間にかかる場合（22:00～翌5:00）
    if (end > NIGHT_START) {
      nighttimeMinutes +=
        Math.min(end, NIGHT_START + 7 * 60) - Math.max(start, NIGHT_START)
    }

    return Math.max(nighttimeMinutes, 0)
  }

  /**
   * HH:MM形式の時刻を分単位に変換します。
   * @param {string} time - HH:MM形式の時刻
   * @returns {number} - 分単位に変換された時刻
   */
  #convertTimeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  /**
   * 時刻がHH:MM形式であるかを検証します。
   * @param {string} time - 検証する時刻
   * @returns {boolean} - 時刻がHH:MM形式であればtrue、そうでなければfalse
   */
  #isValidTimeFormat(time) {
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/
    return timePattern.test(time)
  }

  /**
   * 分単位のプロパティが0以上のNumberであることを検証します。
   * 要件を満たさない場合はコンソールに警告を表示し、nullを返します。
   *
   * @param {number} value - 検証する値
   * @param {string} propName - 検証対象のプロパティ名（警告メッセージ用）
   * @returns {number|null} - 有効な場合はvalueを返し、無効な場合はnullを返します
   */
  #validateMinutes(value, propName) {
    if (typeof value === 'number' && value >= 0) {
      return value
    } else {
      if (typeof value !== 'undefined') {
        // eslint-disable-next-line no-console
        console.warn(
          `Invalid value for ${propName}: ${value}. Expected a non-negative number.`
        )
      }
      return null
    }
  }

  /**
   * 当該インスタンスを複製したインスタンスを返します。
   * - vueコンポーネントにおいてインスタンスを親に返す場合などに、参照渡しを回避するのに使用します。
   * @returns {this.constructor} - 複製された新しいインスタンス
   */
  clone() {
    return Object.assign(new this.constructor(), structuredClone(this))
  }

  /**
   * クラスのプロパティをプレーンなオブジェクトとして返します。
   * @returns {Object} - クラスのプロパティを含むオブジェクト
   */
  toObject() {
    return {
      date: this.date,
      workResult: this.workResult,
      startTime: this._startTime,
      endTime: this._endTime,
      endAtNextday: this.endAtNextday,
      breakMinutes: this._breakMinutes,
      workMinutes: this._workMinutes,
      overtimeMinutes: this._overtimeMinutes,
      nighttimeMinutes: this._nighttimeMinutes,
      qualification: this.qualification,
      ojt: this.ojt,
      scheduledWorkMinutes: this._scheduledWorkMinutes,
      remarks: this.remarks,
      isValid: this.isValid,
    }
  }
}
