import { database } from 'air-firebase'
import { onValue, ref, update } from 'firebase/database'

/**
 * 従業員の配置情報を管理するためのクラス
 */
class ArrangedEmployee {
  /**
   * コンストラクタ
   * @param {string} employeeId - 従業員ID
   * @param {string} startTime - 配置開始時間 (例: "09:00")
   * @param {string} endTime - 配置終了時間 (例: "17:00")
   * @param {number} breakMinutes - 休憩時間（分単位）
   * @param {string} arrivedAt - 出勤時間
   * @param {string} leavedAt - 退勤時間
   * @param {number} temperature - 体温情報
   */
  constructor({
    employeeId,
    startTime,
    endTime,
    breakMinutes,
    arrivedAt,
    leavedAt,
    temperature,
  }) {
    this.employeeId = employeeId
    this.startTime = startTime
    this.endTime = endTime
    this.breakMinutes = breakMinutes
    this.arrivedAt = arrivedAt
    this.leavedAt = leavedAt
    this.temperature = temperature
  }

  /**
   * オブジェクト形式で従業員情報を返します。
   * @returns {Object} 従業員情報オブジェクト
   */
  toObject() {
    return {
      employeeId: this.employeeId,
      startTime: this.startTime,
      endTime: this.endTime,
      breakMinutes: this.breakMinutes,
      arrivedAt: this.arrivedAt,
      leavedAt: this.leavedAt,
      temperature: this.temperature,
    }
  }
}

/**
 * 配置情報を管理するためのクラスです。
 *
 * - インスタンス生成時に、指定された現場IDと日付に基づいて配置情報へのリアルタイムリスナーをセットします。
 *
 * @author shisyamo
 */
export default class Arrangement {
  #listener = null

  // 到着許可時間のオフセット（ミリ秒単位で設定: 1時間）
  static ARRIVAL_ALLOWED_TIME_OFFSET = 60 * 60 * 1000

  /**
   * コンストラクタ
   * @param {string} siteId 現場ID
   * @param {string} date 日付 (YYYY-MM-DD形式)
   * @param {string} workShift 勤務区分 ("day" や "night")
   */
  constructor({ siteId, date, workShift }) {
    this.siteId = siteId
    this.date = date
    this.workShift = workShift
    this.data = null
    this.#subscribeIfNeeded()
  }

  /**
   * 購読する data を参照するためのパスを返します。
   */
  get dataPath() {
    return `Arrangements/${this.date}/${this.siteId}/${this.workShift}`
  }

  /**
   * assignment までのパスを返します。
   */
  get assignmentEmployeesPath() {
    return `Arrangements/assignments/employees/${this.date}`
  }

  get assignmentSitesPath() {
    return `Arrangements/assignments/sites/${this.date}`
  }

  /**
   * 日付を設定し、リアルタイムリスナーをセットします。
   * @param {string} val 設定する日付 (YYYY-MM-DD形式)
   * @throws {TypeError} 無効な日付形式の場合
   */
  setDate(val) {
    this.date = val
    this.#subscribeIfNeeded()
  }

  /**
   * 現場IDを設定し、リアルタイムリスナーをセットします。
   * @param {string} val 設定する現場ID
   * @throws {Error} 現場IDが指定されていない場合
   */
  setSiteId(val) {
    this.siteId = val
    this.#subscribeIfNeeded()
  }

  /**
   * 勤務区分を設定し、リアルタイムリスナーをセットします。
   * @param {string} val 設定する勤務区分 ("day" または "night")
   */
  setWorkShift(val) {
    this.workShift = val
    this.#subscribeIfNeeded()
  }

  /**
   * エラー発生時にリスナーを解除し、エラーをスローします。
   * @param {Error} err エラーオブジェクト
   * @throws {Error} 発生したエラーをそのままスロー
   */
  #handleError(err) {
    // eslint-disable-next-line no-console
    console.error('エラーが発生しました:', err.message)
    this.unsubscribe()
    throw err
  }

  /**
   * 必要に応じて現場ID、日付、および勤務区分に基づきリアルタイムリスナーをセットします。
   */
  #subscribeIfNeeded() {
    if (this.date && this.siteId && this.workShift) {
      this.#subscribe()
    } else {
      // eslint-disable-next-line no-console
      console.warn('date, siteId, and workShift are not set.', {
        date: this.date,
        siteId: this.siteId,
        workShift: this.workShift,
      })
    }
  }

  /**
   * 現場IDと日付に基づきリアルタイムリスナーをセットします。
   */
  #subscribe() {
    this.unsubscribe() // 既存のリスナーがあれば解除

    const targetRef = ref(database, `${this.dataPath}`)
    this.#listener = onValue(targetRef, (snapshot) => {
      this.data = snapshot.val()
    })
  }

  /**
   * 配置情報へのリアルタイムリスナーを解除します。
   */
  unsubscribe() {
    if (this.#listener) this.#listener()
    this.#listener = null
  }

  /**
   * 指定された従業員を配置します。
   * siteContractが指定されている場合、startTime, endTime, breakMinutesを参照します。
   * siteContractが指定されていない場合、これらはnullになります。
   * @param {Object} params - 従業員の配置に必要なパラメータを含むオブジェクト
   * @param {string} params.employeeId - 従業員ID（必須）
   * @param {Object} [params.siteContract] - 現場の取極め情報（オプション）
   * @param {string} [params.siteContract.startTime] - 現場取極めの開始時間
   * @param {string} [params.siteContract.endTime] - 現場取極めの終了時間
   * @param {number} [params.siteContract.breakMinutes] - 現場取極めの休憩時間（分）
   * @param {number} [params.index] - 追加する位置のインデックス（オプション）。指定がない場合、配列の最後に追加。
   * @returns {Promise<void>} 従業員の配置が完了した時点で解決されるPromise
   * @throws {Error} 配置中にエラーが発生した場合
   */
  async add({ employeeId, siteContract = {}, index = null }) {
    if (!employeeId) {
      throw new Error('従業員IDは必須です。')
    }

    // 現在のemployeeIndexを取得し、新しいemployeeIdを指定された位置に挿入
    const currentEmployeeIndex = [...(this.data?.employeeIndex || [])]
    if (currentEmployeeIndex.includes(employeeId)) {
      throw new Error('既に登録されている従業員です。')
    }

    try {
      // siteContractが指定されている場合の参照
      const startTime = siteContract.startTime || null
      const endTime = siteContract.endTime || null
      const breakMinutes = siteContract.breakMinutes || null

      // 新しい従業員情報を生成（temperatureは規定値をnullに設定）
      const newEmployee = new ArrangedEmployee({
        employeeId,
        startTime,
        endTime,
        breakMinutes,
        arrivedAt: '',
        leavedAt: '',
        temperature: null,
      })

      if (index !== null && index >= 0 && index < currentEmployeeIndex.length) {
        // 有効なindexが指定された場合、その位置に追加
        currentEmployeeIndex.splice(index, 0, employeeId)
      } else {
        // indexが指定されていないか、範囲外の場合は最後に追加
        currentEmployeeIndex.push(employeeId)
      }

      // アトミックに更新するための更新オブジェクトを作成
      const updates = {
        [`${this.dataPath}/employeeIndex`]: currentEmployeeIndex,
        [`${this.dataPath}/employees/${employeeId}`]: newEmployee.toObject(),
        [`${this.assignmentEmployeesPath}/${employeeId}/${this.workShift}/${this.siteId}/siteId`]:
          this.siteId,
        [`${this.assignmentSitesPath}/${this.siteId}/${this.workShift}/${employeeId}/employeeId`]:
          employeeId,
      }

      // Firebaseにアトミックに書き込む
      await update(ref(database), updates)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('従業員の配置中にエラーが発生しました:', error.message)
      this.#handleError(
        new Error(`従業員の配置に失敗しました。employeeId: ${employeeId}`)
      )
    }
  }

  /**
   * 指定された従業員を配置から除外します。
   * @param {string} employeeId - 除外する従業員ID
   * @returns {Promise<void>} 従業員の除外が完了した時点で解決されるPromise
   * @throws {Error} 除外中にエラーが発生した場合
   */
  async remove(employeeId) {
    try {
      // 現在のemployeeIndexから該当するemployeeIdを削除
      const updatedEmployeeIndex = (this.data?.employeeIndex || []).filter(
        (id) => id !== employeeId
      )

      // アトミックに更新するための更新オブジェクトを作成
      const updates = {
        [`${this.dataPath}/employeeIndex`]: updatedEmployeeIndex,
        [`${this.dataPath}/employees/${employeeId}`]: null, // nullをセットするとノードが削除される
        [`${this.assignmentEmployeesPath}/${employeeId}/${this.workShift}/${this.siteId}/siteId`]:
          null,
        [`${this.assignmentSitesPath}/${this.siteId}/${this.workShift}/${employeeId}/employeeId`]:
          null,
      }

      // Firebaseにアトミックに書き込む
      await update(ref(database), updates)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('従業員の除外中にエラーが発生しました:', error.message)
      this.#handleError(
        new Error(`従業員の除外に失敗しました。employeeId: ${employeeId}`)
      )
    }
  }

  /**
   * 指定された従業員の情報を更新します。
   * @param {string} employeeId - 更新対象の従業員ID
   * @param {string} startTime - 新しい配置開始時間 (例: "09:00")
   * @param {string} endTime - 新しい配置終了時間 (例: "17:00")
   * @param {number} breakMinutes - 新しい休憩時間（分単位）
   * @returns {Promise<void>} 従業員の更新が完了した時点で解決されるPromise
   * @throws {Error} 更新中にエラーが発生した場合
   */
  async update(employeeId, startTime, endTime, breakMinutes) {
    try {
      // this.dataから該当する従業員情報を取得
      const currentEmployeeData = this.data?.employees?.[employeeId]

      if (!currentEmployeeData) {
        throw new Error(`指定された従業員IDが見つかりません: ${employeeId}`)
      }

      // 該当する従業員のデータを更新
      currentEmployeeData.startTime = startTime
      currentEmployeeData.endTime = endTime
      currentEmployeeData.breakMinutes = breakMinutes

      // 更新後のデータをFirebaseにアトミックに書き込む
      const updates = {
        [`${this.dataPath}/employees/${employeeId}`]: currentEmployeeData,
      }

      await update(ref(database), updates)
    } catch (error) {
      // エラーハンドリング：エラーをログに記録し、エラーをスロー
      // eslint-disable-next-line no-console
      console.error('従業員の更新中にエラーが発生しました:', error.message)
      this.#handleError(
        new Error(`従業員の更新に失敗しました。employeeId: ${employeeId}`)
      )
    }
  }

  /**
   * 指定された従業員の到着時間を現在時刻に更新し、必要に応じて開始時刻を変更します。
   * temperatureは必須項目とし、従業員の体温を記録します。
   * 既に到着記録がある場合、または許可された時間範囲外の場合は更新を行いません。
   * @param {string} employeeId - 更新対象の従業員ID
   * @param {number} temperature - 到着時の体温情報（必須）
   * @param {string} [startTime] - （オプション）新しい開始時刻（例: "08:30"）
   * @returns {Promise<void>} 従業員の到着時間が更新された時点で解決されるPromise
   * @throws {Error} 更新中にエラーが発生した場合
   */
  async arrive(employeeId, temperature, startTime = null) {
    try {
      // temperatureのバリデーション
      if (typeof temperature !== 'number' || isNaN(temperature)) {
        throw new TypeError(
          'Temperatureは必須で、数値で指定する必要があります。'
        )
      }

      // this.dataから該当する従業員情報を取得
      const currentEmployeeData = this.data?.employees?.[employeeId]

      if (!currentEmployeeData) {
        throw new Error(`指定された従業員IDが見つかりません: ${employeeId}`)
      }

      // 既にarrivedAtが存在する場合はエラー
      if (currentEmployeeData.arrivedAt) {
        throw new Error(`従業員ID ${employeeId} は既に到着記録があります。`)
      }

      // dateとstartTimeから基準時刻を計算
      const startDate = this.date // 例: "2024-10-25"
      const effectiveStartTime = startTime || currentEmployeeData.startTime // 新しいstartTimeがあればそれを使う
      if (!startDate || !effectiveStartTime) {
        throw new Error('dateまたはstartTimeが無効です。')
      }

      const baseTime = new Date(`${startDate}T${effectiveStartTime}:00.000Z`)
      const allowedTime = new Date(
        baseTime.getTime() - Arrangement.ARRIVAL_ALLOWED_TIME_OFFSET
      )

      // 現在時刻の取得
      const currentTime = new Date()

      // 現在時刻が許可された範囲内でない場合はエラー
      if (currentTime < allowedTime) {
        throw new Error('到着記録は開始時間の1時間前から可能です。')
      }

      // 到着記録をISO 8601形式に変換して更新
      const currentTimeISO = currentTime.toISOString()

      // 更新用のオブジェクトを作成（arrivedAtの更新、temperatureの記録と、必要であればstartTimeの更新）
      const updates = {
        [`${this.dataPath}/employees/${employeeId}/arrivedAt`]: currentTimeISO,
        [`${this.dataPath}/employees/${employeeId}/temperature`]: temperature,
      }

      // 新しいstartTimeが提供されていて、既存のstartTimeと異なる場合は更新
      if (startTime && startTime !== currentEmployeeData.startTime) {
        updates[`${this.dataPath}/employees/${employeeId}/startTime`] =
          startTime
      }

      // Firebaseにアトミックに書き込む
      await update(ref(database), updates)
    } catch (error) {
      // エラーハンドリング：エラーをログに記録し、エラーをスロー
      // eslint-disable-next-line no-console
      console.error(
        '従業員の到着時間の更新中にエラーが発生しました:',
        error.message
      )
      this.#handleError(
        new Error(
          `従業員の到着時間の更新に失敗しました。employeeId: ${employeeId}`
        )
      )
    }
  }

  /**
   * 指定された従業員の到着記録を初期化します。
   * 既に離脱記録がある場合は初期化を行いません。
   * @param {string} employeeId - 更新対象の従業員ID
   * @returns {Promise<void>} 到着記録の初期化が完了した時点で解決されるPromise
   * @throws {Error} 初期化中にエラーが発生した場合
   */
  async resetArrival(employeeId) {
    try {
      // this.dataから該当する従業員情報を取得
      const currentEmployeeData = this.data?.employees?.[employeeId]

      if (!currentEmployeeData) {
        throw new Error(`指定された従業員IDが見つかりません: ${employeeId}`)
      }

      // 既にleavedAtが存在する場合はエラー
      if (currentEmployeeData.leavedAt) {
        throw new Error(
          `従業員ID ${employeeId} は既に離脱記録があります。到着記録の初期化はできません。`
        )
      }

      // arrivedAtを初期化
      const updates = {
        [`${this.dataPath}/employees/${employeeId}/arrivedAt`]: null, // 初期化のためnullに設定
      }

      // Firebaseにアトミックに書き込む
      await update(ref(database), updates)
    } catch (error) {
      // エラーハンドリング：エラーをログに記録し、エラーをスロー
      // eslint-disable-next-line no-console
      console.error('到着記録の初期化中にエラーが発生しました:', error.message)
      this.#handleError(
        new Error(`到着記録の初期化に失敗しました。employeeId: ${employeeId}`)
      )
    }
  }

  /**
   * 指定された従業員の離脱時間を現在時刻に更新し、必要に応じて開始時刻、終了時刻や休憩時間を変更します。
   * @param {string} employeeId - 更新対象の従業員ID
   * @param {string} [startTime] - （オプション）新しい開始時刻（例: "08:30"）
   * @param {string} [endTime] - （オプション）新しい終了時刻（例: "17:30"）
   * @param {number} [breakMinutes] - （オプション）新しい休憩時間（分単位、例: 0）
   * @returns {Promise<void>} 従業員の離脱記録が更新された時点で解決されるPromise
   * @throws {Error} 更新中にエラーが発生した場合
   */
  async leave(
    employeeId,
    startTime = null,
    endTime = null,
    breakMinutes = null
  ) {
    try {
      // this.dataから該当する従業員情報を取得
      const currentEmployeeData = this.data?.employees?.[employeeId]

      if (!currentEmployeeData) {
        throw new Error(`指定された従業員IDが見つかりません: ${employeeId}`)
      }

      // arrivedAtが設定されていない場合はエラー
      if (!currentEmployeeData.arrivedAt) {
        throw new Error(
          `従業員ID ${employeeId} は到着記録がありません。離脱はできません。`
        )
      }

      // 現在時刻を取得してISO 8601形式に変換
      const currentTimeISO = new Date().toISOString()

      // 更新用のオブジェクトを作成（leavedAtの更新と、必要であればstartTime, endTime, breakMinutesの更新）
      const updates = {
        [`${this.dataPath}/employees/${employeeId}/leavedAt`]: currentTimeISO,
      }

      // 新しいstartTimeが提供されていて、既存のstartTimeと異なる場合は更新
      if (startTime && startTime !== currentEmployeeData.startTime) {
        updates[`${this.dataPath}/employees/${employeeId}/startTime`] =
          startTime
      }

      // 新しいendTimeが提供されていて、既存のendTimeと異なる場合は更新
      if (endTime && endTime !== currentEmployeeData.endTime) {
        updates[`${this.dataPath}/employees/${employeeId}/endTime`] = endTime
      }

      // 新しいbreakMinutesが提供されていて、既存のbreakMinutesと異なる場合は更新
      if (
        breakMinutes !== null &&
        breakMinutes !== currentEmployeeData.breakMinutes
      ) {
        updates[`${this.dataPath}/employees/${employeeId}/breakMinutes`] =
          breakMinutes
      }

      // Firebaseにアトミックに書き込む
      await update(ref(database), updates)
    } catch (error) {
      // エラーハンドリング：エラーをログに記録し、エラーをスロー
      // eslint-disable-next-line no-console
      console.error(
        '従業員の離脱記録の更新中にエラーが発生しました:',
        error.message
      )
      this.#handleError(
        new Error(
          `従業員の離脱記録の更新に失敗しました。employeeId: ${employeeId}`
        )
      )
    }
  }

  /**
   * 指定された従業員の離脱記録を初期化します。
   * siteContractプロパティを参照して終了時刻と休憩時間を初期化します。
   * @param {string} employeeId - 更新対象の従業員ID
   * @returns {Promise<void>} 離脱記録の初期化が完了した時点で解決されるPromise
   * @throws {Error} 初期化中にエラーが発生した場合
   */
  async resetLeave(employeeId) {
    try {
      // this.dataから該当する従業員情報を取得
      const currentEmployeeData = this.data?.employees?.[employeeId]

      if (!currentEmployeeData) {
        throw new Error(`指定された従業員IDが見つかりません: ${employeeId}`)
      }

      // 初期化用のオブジェクトを作成
      const updates = {
        [`${this.siteId}/${this.workShift}/employees/${employeeId}/leavedAt`]:
          null, // 離脱記録を初期化
      }

      // siteContractプロパティを参照
      const contractEndTime = this.siteContract?.endTime || null
      const contractBreakMinutes = this.siteContract?.breakMinutes || 0

      // 終了時刻と休憩時間を強制的に初期化
      updates[`${this.dataPath}/employees/${employeeId}/endTime`] =
        contractEndTime
      updates[`${this.dataPath}/employees/${employeeId}/breakMinutes`] =
        contractBreakMinutes

      // Firebaseにアトミックに書き込む
      await update(ref(database), updates)
    } catch (error) {
      // エラーハンドリング：エラーをログに記録し、エラーをスロー
      // eslint-disable-next-line no-console
      console.error('離脱記録の初期化中にエラーが発生しました:', error.message)
      this.#handleError(
        new Error(`離脱記録の初期化に失敗しました。employeeId: ${employeeId}`)
      )
    }
  }

  /**
   * 指定された従業員の順序を変更し、Realtime Databaseを更新します。
   * @param {string} employeeId - 従業員ID
   * @param {number} newIndex - 新しいインデックス位置
   * @param {number} oldIndex - 元のインデックス位置
   * @returns {Promise<void>} 順序変更が完了した時点で解決されるPromise
   * @throws {Error} 順序変更中にエラーが発生した場合
   */
  async move(employeeId, newIndex, oldIndex) {
    try {
      // employeeIndexを取得
      const currentEmployeeIndex = [...(this.data?.employeeIndex || [])]

      // インデックスが範囲外の場合はエラー
      if (
        oldIndex < 0 ||
        oldIndex >= currentEmployeeIndex.length ||
        newIndex < 0 ||
        newIndex >= currentEmployeeIndex.length
      ) {
        throw new Error('指定されたインデックスが無効です。')
      }

      // employeeIndexの順序を変更
      const [movedEmployee] = currentEmployeeIndex.splice(oldIndex, 1)
      currentEmployeeIndex.splice(newIndex, 0, movedEmployee)

      // アトミックに更新するための更新オブジェクトを作成
      const updates = {
        [`${this.dataPath}/employeeIndex`]: currentEmployeeIndex,
      }

      // Firebaseへのアトミックな更新
      await update(ref(database), updates)
    } catch (error) {
      // エラーハンドリング：エラーをログに記録し、エラーをスロー
      // eslint-disable-next-line no-console
      console.error('従業員の順序変更中にエラーが発生しました:', error.message)
      this.#handleError(
        new Error(`従業員の順序変更に失敗しました。employeeId: ${employeeId}`)
      )
    }
  }
}
