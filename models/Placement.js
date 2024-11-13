/**
 * Placement.js
 *
 * Define classes to manage placement information stored in the Realtime Database.
 * The structure is as follows.
 *
 * /
 * |- Placements
 *    |- siteOrder: <Array>
 *    |  |- 0: { id, siteId, workShift }
 *    |- ${date} (YYYY-MM-DD)
 *    |  |- ${siteId}
 *    |     |- ${workShift} ('day' or 'night')
 *    |        |- employeeOrder: <Array>
 *    |        |- employees
 *    |        |  |- ${employeeId}
 *    |        |    |- employeeId: 'emp123'
 *    |        |    |- startTime: '08:00'
 *    |        |    |- endTime: '17:00'
 *    |        |    |- breakMinutes: 60
 *    |        |    |- confirmedAt: timestamp
 *    |        |    |- arrivedAt: timestamp
 *    |        |    |- leavedAt: timestamp
 *    |        |    |- temperature: 36.5
 *    |        |- outsourcerOrder: <Array>
 *    |        |- outsourcers
 *    |           |- ${outsourcerKey} -> ${outsoucerId}-${branch}
 *    |             |- outsoucerKey: 'outsourcer1-0'
 *    |             |- startTime: '08:00'
 *    |             |- endTime: '17:00'
 *    |             |- breakMinutes: 60
 *    |             |- confirmedAt: timestamp
 *    |             |- arrivedAt: timestamp
 *    |             |- leavedAt: timestamp
 *    |             |- temperature: 36.5
 *    |- assignments
 *       |- employeeAvailability
 *       |  |- ${date}（YYYY-MM-DD）
 *       |     |- day
 *       |     |  |- employeeIds: <Array>
 *       |     |- night
 *       |        |- employeeIds: <Array>
 *       |- employees
 *       |  |- ${date} (YYYY-MM-DD)
 *       |     |- ${employeeId} or ${outsourcerKey}
 *       |        |- ${workShift} ('day' or 'night')
 *       |           |- ${siteId}
 *       |              |- siteId: 'site456'
 *       |- sites
 *       |  |- ${date} (YYYY-MM-DD)
 *             |- ${siteId}
 *                |- ${workShift} ('day' or 'night')
 *                   |- ${id}
 *                      |- id: 'emp123' or 'outsourcer1-0'
 *                      |- isEmployee: true or false
 *
 * [Placements/siteOrder<Array>]
 * - An array of 'siteId' and 'workShift' conbined '-'.
 * - Used to manage the display order of sites.
 *
 * [Placements/${date}/${siteId}/${workShift}/employeeOrder]
 * - An array of 'employeeId'.
 * - Used to manage the display order of employees for a placemente.
 *
 * [Placements/${date}/${siteId}/${workShift}/employees]
 * - An object containing each employee's placement information.
 *
 * [Placements/assignments/employees]
 * - Stores assingment information of when and where each employee is placed.
 * - Useful for ensure employees are not placed at multiple sites on the same day.
 *
 * [Placements/assignments/sites]
 * - Stores assignment information of who is placed at each site and when.
 * - Useful for ensure sites are not listed in `siteOrder` still have assigned employees.
 */

import { database } from 'air-firebase'
import { ref, onValue, update } from 'firebase/database'

// const ARRIVAL_ALLOWED_TIME_OFFSET = 60 * 60 * 1000

/**
 * Represents the placement information of an employee, stored at
 * `Placements/${date}/${siteId}/${workShift}/employees` in the Realtime Database.
 */
class PlacedEmployee {
  /**
   * Initializes a PlacedEmployee instance.
   * @constructor
   * @param {Object} args - Initialization arguments.
   * @param {string} args.employeeId - The employee's ID.
   * @param {string} args.startTime - The start time (HH:MM).
   * @param {string} args.endTime - The end time (HH:MM).
   * @param {number} args.breakMinutes - The break duration in minutes.
   * @param {Object} args.confirmedAt - 配置確認日時（タイムスタンプ）
   * @param {Object} args.arrivedAt - The arrival time (timestamp).
   * @param {Object} args.leavedAt - The departure time (timestamp).
   * @param {number} args.temperature - The temperature recorded.
   */
  constructor({
    employeeId,
    startTime,
    endTime,
    breakMinutes,
    confirmedAt,
    arrivedAt,
    leavedAt,
    temperature,
  } = {}) {
    this.employeeId = employeeId || ''
    this.startTime = startTime || ''
    this.endTime = endTime || ''
    this.breakMinutes = breakMinutes || null
    this.confirmedAt = confirmedAt || null
    this.arrivedAt = arrivedAt || null
    this.leavedAt = leavedAt || null
    this.temperature = temperature || null
  }

  /**
   * Converts the PlacedEmployee instance to a plain object.
   * @returns {Object} The plain object representation of the instance.
   */
  toObject() {
    return {
      employeeId: this.employeeId,
      startTime: this.startTime,
      endTime: this.endTime,
      breakMinutes: this.breakMinutes,
      confirmedAt: this.confirmedAt,
      arrivedAt: this.arrivedAt,
      leavedAt: this.leavedAt,
      temperature: this.temperature,
    }
  }
}

/**
 * Represents the placement information of an outsourcer, stored at
 * `Placements/${date}/${siteId}/${workShift}/outsourcers` in the Realtime Database.
 */
class PlacedOutsourcer extends PlacedEmployee {
  /**
   * Initializes a PlacedOutsourcer instance.
   * @constructor
   * @param {Object} args - Initialization arguments.
   * @param {string} args.outsourcerKey - The outsourcer's KEY.
   * @param {string} args.startTime - The start time (HH:MM).
   * @param {string} args.endTime - The end time (HH:MM).
   * @param {number} args.breakMinutes - The break duration in minutes.
   * @param {Object} args.confirmedAt - 配置確認日時（タイムスタンプ）
   * @param {Object} args.arrivedAt - The arrival time (timestamp).
   * @param {Object} args.leavedAt - The departure time (timestamp).
   * @param {number} args.temperature - The temperature recorded.
   */
  constructor({
    outsourcerKey,
    startTime,
    endTime,
    breakMinutes,
    confirmedAt,
    arrivedAt,
    leavedAt,
    temperature,
  } = {}) {
    super({
      startTime,
      endTime,
      breakMinutes,
      confirmedAt,
      arrivedAt,
      leavedAt,
      temperature,
    })
    delete this.employeeId
    this.outsourcerKey = outsourcerKey || ''
  }

  /**
   * Converts the PlacedEmployee instance to a plain object.
   * @returns {Object} The plain object representation of the instance.
   */
  toObject() {
    return {
      outsourcerKey: this.outsourcerKey,
      startTime: this.startTime,
      endTime: this.endTime,
      breakMinutes: this.breakMinutes,
      confirmedAt: this.confirmedAt,
      arrivedAt: this.arrivedAt,
      leavedAt: this.leavedAt,
      temperature: this.temperature,
    }
  }
}

/**
 * The Placement class manages employee placement information stored in the Firebase Realtime Database.
 * It provides methods to set up real-time listeners, add or remove employee placements,
 * record employee arrivals and departures, reset leave data, and move employees within a specific order.
 *
 * Key Responsibilities:
 * - Establish and manage real-time listeners for tracking live placement data.
 * - Add new placement records and remove existing ones with atomic updates.
 * - Record employee arrival and departure information, including time, temperature, and shift details.
 * - Reset leave details and restore default contract values where necessary.
 * - Reorder employees within a shift and update the order in the database.
 *
 * This class ensures accurate and synchronized management of employee placement data across
 * shifts, sites, and specific dates in the Realtime Database.
 */
class Placement {
  // Listener for the Realtime Database.
  #listener = null

  /**
   * Initializes an Placement instance.
   *
   * @constructor
   * @param {Object} args - Initialization arguments.
   * @param {string} args.date - The target date in YYYY-MM-DD format.
   * @param {string} args.siteId - The target site ID.
   * @param {string} args.workShift - The target work shift, either 'day' or 'night'.
   */
  constructor({ date, siteId, workShift }) {
    // Initialize properties with provided arguments
    this.setDate(date)
    this.setSiteId(siteId)
    this.setWorkShift(workShift)

    // Placeholder for employee data and orders
    this.data = {}

    // Expose employee methods in employee property
    this.employee = {
      add: this.addEmployee.bind(this),
      addBulk: this.addEmployees.bind(this),
      arrive: this.arriveEmployee.bind(this),
      move: this.moveEmployee.bind(this),
      leave: this.leaveEmployee.bind(this),
      remove: this.removeEmployee.bind(this),
      confirm: this.confirmEmployee.bind(this),
      unconfirm: this.unconfirmEmployee.bind(this),
    }

    // Expose outsourcer methods in outsourcer property
    this.outsourcer = {
      // add: this.addOutsourcer.bind(this), // KEY にインデックスを使用するため、D&D による追加は不可。
      addBulk: this.addOutsourcers.bind(this),
      arrive: this.arriveOutsourcer.bind(this),
      move: this.moveOutsourcer.bind(this),
      leave: this.leaveOutsourcer.bind(this),
      remove: this.removeOutsourcer.bind(this),
      confirm: this.confirmOutsourcer.bind(this),
      unconfirm: this.unconfirmOutsourcer.bind(this),
    }
  }

  /**
   * Sets the date property.
   *
   * If the date changes and a listener is already active, it will re-subscribe.
   *
   * @param {string} date - The target date in YYYY-MM-DD format.
   * @throws {Error} Throws an error if the date is not a string.
   */
  setDate(date) {
    if (!date || typeof date !== 'string') {
      const message = `setDate requires a string argument. Received ${date}`
      console.error(message) // eslint-disable-line no-console
      throw new Error(message)
    }

    if (this.date !== date) {
      this.date = date
      if (this.#listener) this.subscribe() // Re-subscribe if a listener exists
    }
  }

  /**
   * Sets the siteId property.
   *
   * If the siteId changes and a listener is already active, it will re-subscribe.
   *
   * @param {string} siteId - The target site ID.
   * @throws {Error} Throws an error if siteId is not a string.
   */
  setSiteId(siteId) {
    if (!siteId || typeof siteId !== 'string') {
      const message = `setSiteId requires a string argument. Received ${siteId}`
      console.error(message) // eslint-disable-line no-console
      throw new Error(message)
    }

    if (this.siteId !== siteId) {
      this.siteId = siteId
      if (this.#listener) this.subscribe() // Re-subscribe if a listener exists
    }
  }

  /**
   * Sets the workShift property.
   *
   * If the workShift changes and a listener is already active, it will re-subscribe.
   *
   * @param {string} workShift - The target work shift, either 'day' or 'night'.
   * @throws {Error} Throws an error if workShift is not 'day' or 'night'.
   */
  setWorkShift(workShift) {
    if (!workShift || typeof workShift !== 'string') {
      const message = `setWorkShift requires a string argument. Received ${workShift}`
      console.error(message) // eslint-disable-line no-console
      throw new Error(message)
    }

    if (!['day', 'night'].includes(workShift)) {
      const message = `A workShift must be 'day' or 'night'. Received ${workShift}`
      console.error(message) // eslint-disable-line no-console
      throw new Error(message)
    }

    if (this.workShift !== workShift) {
      this.workShift = workShift
      if (this.#listener) this.subscribe() // Re-subscribe if a listener exists
    }
  }

  /**
   * Generates the path for employees under Placements for the current date, site, and shift.
   * @param {string} employeeId - The employee's ID.
   * @returns {string} The employees path in the Realtime Database.
   */
  getEmployeesPath(employeeId) {
    return `Placements/${this.date}/${this.siteId}/${this.workShift}/employees/${employeeId}`
  }

  /**
   * Generates the path for outsourcers under Placements for the current date, site, and shift.
   * @param {string} outsourcerKey - The outsourcer's KEY.
   * @returns {string} The outsourcers path in the Realtime Database.
   */
  getOutsourcersPath(outsourcerKey) {
    return `Placements/${this.date}/${this.siteId}/${this.workShift}/outsourcers/${outsourcerKey}`
  }

  /**
   * Generates the path for employeeOrder under Placements for the current date, site, and shift.
   * @returns {string} The employeeOrder path in the Realtime Database.
   */
  getEmployeeOrderPath() {
    return `Placements/${this.date}/${this.siteId}/${this.workShift}/employeeOrder`
  }

  /**
   * Generates the path for outsourcerOrder under Placements for the current date, site, and shift.
   * @returns {string} The outsourcerOrder path in the Realtime Database.
   */
  getOutsourcerOrderPath() {
    return `Placements/${this.date}/${this.siteId}/${this.workShift}/outsourcerOrder`
  }

  /**
   * Generates the path for an employee's assignment entry under Placements.
   * @param {string} employeeId - The employee's ID.
   * @returns {string} The assignment path for the employee in the Realtime Database.
   */
  getAssignmentsEmployeesPath(employeeId) {
    return `Placements/assignments/employees/${this.date}/${employeeId}/${this.workShift}/${this.siteId}`
  }

  /**
   * Generates the path for an outsourcer's assignment entry under Placements.
   * @param {string} outsourcerKey - The outsourcer's KEY.
   * @returns {string} The assignment path for the outsourcer in the Realtime Database.
   */
  getAssignmentsOutsourcersPath(outsourcerKey) {
    return `Placements/assignments/outsourcers/${this.date}/${outsourcerKey}/${this.workShift}/${this.siteId}`
  }

  /**
   * Generates the path for a site's assignment entry under Placements.
   * @param {string} employeeId - The employee's ID or outsourcer's KEY.
   * @returns {string} The assignment path for the site in the Realtime Database.
   */
  getAssignmentsSitesPath(id) {
    return `Placements/assignments/sites/${this.date}/${this.siteId}/${this.workShift}/${id}`
  }

  /**
   * Begins subscribing to placement data.
   *
   * Sets up a real-time listener on the placement data for the
   * specified `date`, `siteId`, and `workShift`. Ensure that all required properties
   * (`date`, `siteId`, and `workShift`) are set before calling this method.
   *
   * If a listener is already active, it will be removed before establishing a new one.
   *
   * @throws {Error} Throws an error if `date`, `siteId`, or workShift are not set.
   */
  subscribe() {
    // Remove any existing listener before subscribing
    this.unsubscribe()

    // Verify that required properties are set
    const missingFields = ['date', 'siteId', 'workShift'].filter(
      (field) => !this[field]
    )
    if (missingFields.length) {
      const message = `Missing required properties: ${missingFields.join(
        ', '
      )}.`
      const { date, siteId, workShift } = this
      console.error(message, { date, siteId, workShift }) // eslint-disable-line no-console
      throw new Error(message)
    }

    try {
      // Get a reference to the database
      const dbRef = ref(
        database,
        `Placements/${this.date}/${this.siteId}/${this.workShift}`
      )
      this.#listener = onValue(
        dbRef,
        (snapshot) => {
          this.data = snapshot.exists() ? snapshot.val() : {}
        },
        (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to subscribe to placement data:', error)

          // Unsubscribe in case of a database error
          this.unsubscribe()
          throw new Error('Subscription failed due to a database error.')
        }
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        'An error occurred while setting up the subscription:',
        error
      )
      throw error
    }
  }

  /**
   * Unsubscribes from placement data.
   *
   * This method removes the active real-time listener, if it exists,
   * allowing for proper cleanup when the subscription is no longer needed.
   * It also resets this.data to an empty object.
   */
  unsubscribe() {
    if (this.#listener) {
      this.#listener() // Detach the listener
      this.#listener = null
      this.data = {} // Reset data to an empty object
      // eslint-disable-next-line no-console
      console.log(
        'Unsubscribed from placement data and reset data to an empty object.'
      )
    }
  }

  /**
   * 引数で従業員IDの配列を受け取り、一括で配置情報を登録します。
   * @param {Object} options
   * @param {Array<string>} options.employeeIds - 従業員IDの配列です。
   * @param {string|null} [options.startTime=null] - 開始時刻です。
   * @param {string|null} [options.endTime=null] - 終了時刻です。
   * @param {number|null} [options.breakMinutes=null] - 休憩時間です。
   * @throws {TypeError} employeeIds が配列でない場合、エラーをスローします。
   */
  async addEmployees({
    employeeIds = [],
    startTime = null,
    endTime = null,
    breakMinutes = null,
  } = {}) {
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      const message = `[addEmployees] "employeeIds" が配列でない、または長さが0です。 employeeIds: ${employeeIds}`
      throw new TypeError(message)
    }

    for (const employeeId of employeeIds) {
      if (typeof employeeId !== 'string') {
        const message = `[addEmployees] "employeeIds"配列の要素に文字列以外が含まれています。 employeeIds: ${employeeIds}`
        throw new TypeError(message)
      }
    }

    try {
      for (const employeeId of employeeIds) {
        await this.addEmployee({ employeeId, startTime, endTime, breakMinutes })
      }
    } catch (error) {
      const message = `[addEmployees] 従業員の一括登録に失敗しました。`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /**
   * Outsourcersを一括でサイトに追加します。
   * - 新しいoutsourcerは`outsourcerOrder`の末尾に追加されます。
   * - 外注先IDは単一しか受け付けません。
   * @param {Object} options - Outsourcer追加のオプション。
   * @param {string} options.outsourcerId - 追加する単一のoutsourcer ID。
   * @param {number} options.length - 追加するoutsourcerの数。
   * @param {string|null} [options.startTime=null] - 開始時刻
   * @param {string|null} [options.endTime=null] - 終了時刻
   * @param {number|null} [options.breakMinutes=null] - 休憩時間
   * @throws {TypeError} `outsourcerId`が文字列でない場合、または`length`が1未満の場合にエラーを投げます。
   */
  async addOutsourcers({
    outsourcerId,
    length,
    startTime = null,
    endTime = null,
    breakMinutes = null,
  } = {}) {
    // outsourcerIdが文字列かどうかを確認
    if (typeof outsourcerId !== 'string') {
      const message = `[addOutsourcers] "outsourcerId" must be a string. Provided: ${outsourcerId}`
      throw new TypeError(message)
    }

    // lengthが1以上の数値かどうかを確認
    if (typeof length !== 'number' || length < 1) {
      // eslint-disable-next-line no-console
      console.warn(`[addOutsourcers] "length" must be a number greater than 0.`)
      return
    }

    const outsourcerOrder = this.data?.outsourcerOrder || []
    const updates = {}

    // outsourcerIdに一致する要素をフィルタリングして降順にソート
    const filteredOrder = outsourcerOrder
      .filter((outsourcer) => outsourcer.split('-')[0] === outsourcerId)
      .sort((a, b) => (a < b ? 1 : -1))

    // 次のカウント値を計算
    const outsourcerCount = filteredOrder.length
      ? parseInt(filteredOrder[filteredOrder.length - 1].split('-')[1], 10) + 1
      : 0

    // length分のoutsourcerを追加
    for (let index = 0; index < length; index++) {
      const outsourcerKey = `${outsourcerId}-${outsourcerCount + index}`

      // 新しいPlacedOutsourcerインスタンスを作成
      const newOutsourcer = new PlacedOutsourcer({
        outsourcerKey,
        startTime,
        endTime,
        breakMinutes,
      })

      outsourcerOrder.push(outsourcerKey)

      // updatesオブジェクトを構築
      updates[this.getOutsourcersPath(outsourcerKey)] = newOutsourcer.toObject()
      updates[`${this.getAssignmentsOutsourcersPath(outsourcerKey)}/siteId`] =
        this.siteId
      updates[`${this.getAssignmentsSitesPath(outsourcerKey)}/id`] =
        outsourcerId
      updates[
        `${this.getAssignmentsSitesPath(outsourcerKey)}/isEmployee`
      ] = false
    }

    // データベースをアトミックに更新
    updates[this.getOutsourcerOrderPath()] = outsourcerOrder

    try {
      await update(ref(database), updates)
      // eslint-disable-next-line no-console
      console.info(`[addOutsourcers] Successfully added bulk outsourcers.`)
    } catch (error) {
      const message = `[addOutsourcers] Failed to update the database with new placement entries.`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /**
   * 従業員を配置に登録します。
   * @param {Object} options
   * @param {string} options.employeeId - 従業員IDです。
   * @param {string|null} [options.startTime=null] - 開始時刻です。
   * @param {string|null} [options.endTime=null] - 終了時刻です。
   * @param {number|null} [options.breakMinutes=null] - 休憩時間です。
   * @throws 従業員IDが指定されていない、文字列ではない、または employeeOrder に既に存在している場合、エラーをスローします。
   */
  async addEmployee({
    employeeId,
    index = null,
    startTime = null,
    endTime = null,
    breakMinutes = null,
  } = {}) {
    // Validate employeeId
    if (!employeeId || typeof employeeId !== 'string') {
      const message = `[addEmployee] "employeeId"は文字列で指定する必要があります。 employeeId: ${employeeId}`
      console.error(message) // eslint-disable-line no-console
      throw new Error(message)
    }

    const employeeOrder = this.data?.employeeOrder || []

    // Check if the employee is already in employeeOrder
    if (employeeOrder.includes(employeeId)) {
      const message = `[addEmployee] 指定された従業員は既に登録されています。 employeeId: ${employeeId}`
      console.error(message) // eslint-disable-line no-console
      throw new Error(message)
    }

    /**
     * Insert employee ID into employeeOrder.
     * - If a valid index is provided, insert at that position.
     * - If index is null or out of range, add to the end.
     */
    if (index !== null && index >= 0 && index < employeeOrder.length) {
      employeeOrder.splice(index, 0, employeeId)
    } else {
      employeeOrder.push(employeeId)
    }

    // Create a new PlacedEmployee instance with siteContract details
    const newEmployee = new PlacedEmployee({
      employeeId,
      startTime,
      endTime,
      breakMinutes,
    })

    // Prepare an atomic update object for the database
    const updates = {
      [`${this.getEmployeeOrderPath()}`]: employeeOrder,
      [`${this.getEmployeesPath(employeeId)}`]: newEmployee.toObject(),
      [`${this.getAssignmentsEmployeesPath(employeeId)}/siteId`]: this.siteId,
      [`${this.getAssignmentsSitesPath(employeeId)}/id`]: employeeId,
      [`${this.getAssignmentsSitesPath(employeeId)}/isEmployee`]: true,
    }

    // Perform an atomic update in the database with error handling
    try {
      await update(ref(database), updates)
    } catch (error) {
      const message = `Failed to update Realtime Database with new placement entry.`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /**
   * Adds a new placement entry to the Realtime Database.
   * - Adds the outsourcer KEY to `outsourcerOrder`.
   * - Adds placement details to `outsourcers`.
   * - Registers outsourcer assignment in `assignmentsOutsourcersPath`.
   * - Registers site assignment in `assignmentsSitesPath`.
   *
   * @param {Object} args - The placement arguments.
   * @param {string} args.outsourcerKey - The outsourcer's KEY.
   * @param {number|null} [args.index=null] - The position in `outsourcerOrder` where the outsourcer KEY should be added.
   * @param {Object} [args.siteContract=null] - Details of the outsourcer's shift (startTime, endTime, breakMinutes).
   * @throws Will throw an error if `outsourcerId` is not provided or is not a string.
   */
  // async addOutsourcer({
  //   outsourcerKey,
  //   index = null,
  //   siteContract = null,
  // } = {}) {
  //   // Validate outsourcerId
  //   if (!outsourcerKey || typeof outsourcerKey !== 'string') {
  //     const message = `outsourcerKey must be specified as a string. Received ${outsourcerKey}`
  //     console.error(message) // eslint-disable-line no-console
  //     throw new Error(message)
  //   }

  //   const outsourcerOrder = this.data?.outsourcerOrder || []

  //   // Check if the outsourcer is already in outsourcerOrder
  //   if (outsourcerOrder.includes(outsourcerKey)) {
  //     const message = `Specified outsourcer already exists. outsourcerKey: ${outsourcerKey}`
  //     console.error(message) // eslint-disable-line no-console
  //     throw new Error(message)
  //   }

  //   /**
  //    * Insert outsourcer KEY into outsourcerOrder.
  //    * - If a valid index is provided, insert at that position.
  //    * - If index is null or out of range, add to the end.
  //    */
  //   if (index !== null && index >= 0 && index < outsourcerOrder.length) {
  //     outsourcerOrder.splice(index, 0, outsourcerKey)
  //   } else {
  //     outsourcerOrder.push(outsourcerKey)
  //   }

  //   // Create a new PlacedOutsourcer instance with siteContract details
  //   const newOutsourcer = new PlacedOutsourcer({
  //     outsourcerKey,
  //     startTime: siteContract?.startTime || null,
  //     endTime: siteContract?.endTime || null,
  //     breakMinutes: siteContract?.breakMinutes || null,
  //   })

  //   // Prepare an atomic update object for the database
  //   const updates = {
  //     [`${this.getOutsourcerOrderPath()}`]: outsourcerOrder,
  //     [`${this.getOutsourcersPath(outsourcerKey)}`]: newOutsourcer.toObject(),
  //     [`${this.getAssignmentsOutsourcersPath(outsourcerKey)}/siteId`]:
  //       this.siteId,
  //     [`${this.getAssignmentsSitesPath(outsourcerKey)}/id`]: outsourcerKey,
  //     [`${this.getAssignmentsSitesPath(outsourcerKey)}/isEmployee`]: false,
  //   }

  //   // Perform an atomic update in the database with error handling
  //   try {
  //     await update(ref(database), updates)
  //   } catch (error) {
  //     const message = `Failed to update Realtime Database with new placement entry.`
  //     console.error(message, error) // eslint-disable-line no-console
  //     throw new Error(`${message} ${error.message}`)
  //   }
  // }

  /**
   * Removes a placement entry for the specified employee from the Realtime Database.
   * - Removes the employee ID from `employeeOrder`.
   * - Deletes the employee's placement data from `employees`.
   * - Removes the employee's assignment from `assignmentsEmployeesPath`.
   * - Removes the site assignment for the employee in `assignmentsSitesPath`.
   *
   * @param {string} employeeId - The ID of the employee to remove from placements.
   * @throws Will throw an error if there is an issue with the database update.
   */
  async removeEmployee(employeeId) {
    // Create a new employeeOrder array, excluding the specified employee ID.
    const employeeOrder = (this.data?.employeeOrder || []).filter(
      (id) => id !== employeeId
    )

    try {
      // Prepare atomic update object to remove employee data and assignments
      const updates = {
        [`${this.getEmployeeOrderPath()}`]: employeeOrder, // Update employee order without the removed employee
        [`${this.getEmployeesPath(employeeId)}`]: null, // Remove employee data from employees node
        [`${this.getAssignmentsEmployeesPath(employeeId)}/siteId`]: null, // Clear employee's site assignment
        [`${this.getAssignmentsSitesPath(employeeId)}`]: null, // Clear site assignment for the employee
      }

      // Perform atomic update in the database
      await update(ref(database), updates)
    } catch (error) {
      const message = `Failed to remove placement entry for employeeId: ${employeeId}.`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /**
   * Removes a placement entry for the specified outsourcer from the Realtime Database.
   * - Removes the outsourcer KEY from `outsourcerOrder`.
   * - Deletes the outsourcer's placement data from `outsourcers`.
   * - Removes the outsourcer's assignment from `assignmentsOutsourcersPath`.
   * - Removes the site assignment for the outsourcer in `assignmentsSitesPath`.
   *
   * @param {string} outsourcerKey - The KEY of the outsourcer to remove from placements.
   * @throws Will throw an error if there is an issue with the database update.
   */
  async removeOutsourcer(outsourcerKey) {
    // Create a new outsourcerOrder array, excluding the specified outsourcer KEY.
    const outsourcerOrder = (this.data?.outsourcerOrder || []).filter(
      (id) => id !== outsourcerKey
    )

    try {
      // Prepare atomic update object to remove outsourcer data and assignments
      const updates = {
        [`${this.getOutsourcerOrderPath()}`]: outsourcerOrder, // Update outsourcer order without the removed outsourcer
        [`${this.getOutsourcersPath(outsourcerKey)}`]: null, // Remove outsourcer data from outsourcers node
        [`${this.getAssignmentsOutsourcersPath(outsourcerKey)}/siteId`]: null, // Clear outsourcer's site assignment
        [`${this.getAssignmentsSitesPath(outsourcerKey)}`]: null, // Clear site assignment for the outsourcer
      }

      // Perform atomic update in the database
      await update(ref(database), updates)
    } catch (error) {
      const message = `Failed to remove placement entry for outsourcerKey: ${outsourcerKey}.`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /***************************************************************************
   * 従業員の配置状態を `確認済` に更新します。
   * @param {string} employeeId - 従業員ID
   * @throws {Error} 指定された従業員の配置データが存在しない場合、
   *                 またはデータベース更新に失敗した場合にスローされます。
   ***************************************************************************/
  async confirmEmployee(employeeId) {
    // 従業員の現在の配置データを取得
    const employeeData = this.data?.employees?.[employeeId]
    if (!employeeData) {
      throw new Error(
        `指定された従業員の配置データが取得できませんでした。従業員ID: ${employeeId}`
      )
    }

    // 既に確認済みの場合は処理を終了
    if (employeeData.confirmedAt) return

    // 更新データを作成（到着時刻と退出時刻は初期化）
    const updates = {
      [`${this.getEmployeesPath(employeeId)}/confirmedAt`]: new Date(),
      [`${this.getEmployeesPath(employeeId)}/arrivedAt`]: null,
      [`${this.getEmployeesPath(employeeId)}/leavedAt`]: null,
    }

    try {
      await update(ref(database), updates)
    } catch (error) {
      const message = `従業員ID: ${employeeId} の配置状態の更新に失敗しました。`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /***************************************************************************
   * 外注先の配置状態を `確認済` に更新します。
   * @param {string} outsourcerKey - 外注先KEY
   * @throws {Error} 指定された外注先の配置データが存在しない場合、
   *                 またはデータベース更新に失敗した場合にスローされます。
   ***************************************************************************/
  async confirmOutsourcer(outsourcerKey) {
    // 外注先の現在の配置データを取得
    const outsourcerData = this.data?.outsourcers?.[outsourcerKey]
    if (!outsourcerData) {
      throw new Error(
        `指定された外注先の配置データが取得できませんでした。外注先ID: ${outsourcerKey}`
      )
    }

    // 既に確認済みの場合は処理を終了
    if (outsourcerData.confirmedAt) return

    // 更新データを作成（到着時刻と退出時刻は初期化）
    const updates = {
      [`${this.getOutsourcersPath(outsourcerKey)}/confirmedAt`]: new Date(),
      [`${this.getOutsourcersPath(outsourcerKey)}/arrivedAt`]: null,
      [`${this.getOutsourcersPath(outsourcerKey)}/leavedAt`]: null,
    }

    try {
      await update(ref(database), updates)
    } catch (error) {
      const message = `外注先ID: ${outsourcerKey} の配置状態の更新に失敗しました。`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /***************************************************************************
   * 従業員の配置状態を `上番済` に更新します。
   * @param {Object} params - パラメータオブジェクト
   * @param {string} params.employeeId - 従業員ID
   * @param {number|null} [params.temperature=null] - 体温（オプション）
   * @param {string|null} [params.startTime=null] - 開始時刻（オプション）
   * @throws {TypeError} 体温または開始時刻の型が不正な場合にスローされます。
   * @throws {Error} 指定された従業員の配置データが存在しない場合、
   *                 またはデータベース更新に失敗した場合にスローされます。
   ***************************************************************************/
  async arriveEmployee({
    employeeId,
    temperature = null,
    startTime = null,
  } = {}) {
    // 体温が指定されていれば型をチェック
    if (
      temperature !== null &&
      (typeof temperature !== 'number' || isNaN(temperature))
    ) {
      throw new TypeError(
        `体温は数値でなくてはなりません。体温: ${temperature}`
      )
    }

    // 開始時刻が指定されていれば型をチェック
    if (startTime !== null && typeof startTime !== 'string') {
      throw new TypeError(
        `開始時刻は文字列でなくてはなりません。開始時刻: ${startTime}`
      )
    }

    // 現在の配置データを取得
    const employeeData = this.data?.employees?.[employeeId]
    if (!employeeData) {
      throw new Error(
        `指定された従業員の配置データが取得できませんでした。従業員ID: ${employeeId}`
      )
    }

    // 更新データを作成（退出時刻は初期化）
    const updates = {
      [`${this.getEmployeesPath(employeeId)}/arrivedAt`]: new Date(),
      [`${this.getEmployeesPath(employeeId)}/leavedAt`]: null,
    }

    if (temperature !== null) {
      updates[`${this.getEmployeesPath(employeeId)}/temperature`] = temperature
    }

    if (startTime !== null) {
      updates[`${this.getEmployeesPath(employeeId)}/startTime`] = startTime
    }

    try {
      await update(ref(database), updates)
    } catch (error) {
      const message = `従業員ID: ${employeeId} の配置状態の更新に失敗しました。`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /***************************************************************************
   * 外注先の配置状態を `上番済` に更新します。
   *
   * @param {Object} params - パラメータオブジェクト
   * @param {string} params.outsourcerKey - 外注先KEY
   * @param {number|null} [params.temperature=null] - 体温（オプション）
   * @param {string|null} [params.startTime=null] - 開始時刻（オプション）
   * @throws {TypeError} 体温または開始時刻の型が不正な場合にスローされます。
   * @throws {Error} 指定された外注先の配置データが存在しない場合、
   *                 またはデータベース更新に失敗した場合にスローされます。
   ***************************************************************************/
  async arriveOutsourcer({
    outsourcerKey,
    temperature = null,
    startTime = null,
  } = {}) {
    // 体温が指定されていれば型をチェック
    if (
      temperature !== null &&
      (typeof temperature !== 'number' || isNaN(temperature))
    ) {
      throw new TypeError(
        `体温は数値でなくてはなりません。体温: ${temperature}`
      )
    }

    // 開始時刻が指定されていれば型をチェック
    if (startTime !== null && typeof startTime !== 'string') {
      throw new TypeError(
        `開始時刻は文字列でなくてはなりません。開始時刻: ${startTime}`
      )
    }

    // 現在の配置データを取得
    const outsourcerData = this.data?.outsourcers?.[outsourcerKey]
    if (!outsourcerData) {
      throw new Error(
        `指定された外注先の配置データが取得できませんでした。外注先ID: ${outsourcerKey}`
      )
    }

    // 更新データを作成（退出時刻は初期化）
    const updates = {
      [`${this.getOutsourcersPath(outsourcerKey)}/arrivedAt`]: new Date(),
      [`${this.getOutsourcersPath(outsourcerKey)}/leavedAt`]: null,
    }

    if (temperature !== null) {
      updates[`${this.getOutsourcersPath(outsourcerKey)}/temperature`] =
        temperature
    }

    if (startTime !== null) {
      updates[`${this.getOutsourcersPath(outsourcerKey)}/startTime`] = startTime
    }

    try {
      await update(ref(database), updates)
    } catch (error) {
      const message = `外注先KEY: ${outsourcerKey} の配置状態の更新に失敗しました。`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /***************************************************************************
   * 従業員の配置状態を `退勤済` に更新します。
   * @param {Object} params - パラメータオブジェクト
   * @param {string} params.employeeId - 従業員ID
   * @param {string|null} [params.startTime=null] - 開始時刻（オプション）
   * @param {string|null} [params.endTime=null] - 終了時刻（オプション）
   * @param {number|null} [params.breakMinutes=null] - 休憩時間（分単位・オプション）
   * @throws {Error} 指定された従業員の配置データが存在しない場合、
   *                 またはデータベース更新に失敗した場合にスローされます。
   ***************************************************************************/
  async leaveEmployee({
    employeeId,
    startTime = null,
    endTime = null,
    breakMinutes = null,
  } = {}) {
    // 現在の従業員データを取得
    const employeeData = this.data?.employees?.[employeeId]
    if (!employeeData) {
      throw new Error(
        `指定された従業員の配置データが取得できませんでした。従業員ID: ${employeeId}`
      )
    }

    // 更新データを作成
    const updates = {
      [`${this.getEmployeesPath(employeeId)}/leavedAt`]: new Date(),
    }

    if (startTime !== null) {
      updates[`${this.getEmployeesPath(employeeId)}/startTime`] = startTime
    }

    if (endTime !== null) {
      updates[`${this.getEmployeesPath(employeeId)}/endTime`] = endTime
    }

    if (breakMinutes !== null) {
      updates[`${this.getEmployeesPath(employeeId)}/breakMinutes`] =
        breakMinutes
    }

    try {
      await update(ref(database), updates)
    } catch (error) {
      const message = `従業員ID: ${employeeId} の配置状態の更新に失敗しました。`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /***************************************************************************
   * 外注先の配置状態を `退勤済` に更新します。
   *
   * @param {Object} params - パラメータオブジェクト
   * @param {string} params.outsourcerKey - 外注先KEY
   * @param {string|null} [params.startTime=null] - 開始時刻（オプション）
   * @param {string|null} [params.endTime=null] - 終了時刻（オプション）
   * @param {number|null} [params.breakMinutes=null] - 休憩時間（分単位・オプション）
   * @throws {Error} 指定された外注先の配置データが存在しない場合、
   *                 またはデータベース更新に失敗した場合にスローされます。
   ***************************************************************************/
  async leaveOutsourcer({
    outsourcerKey,
    startTime = null,
    endTime = null,
    breakMinutes = null,
  } = {}) {
    // 現在の外注先データを取得
    const outsourcerData = this.data?.outsourcers?.[outsourcerKey]
    if (!outsourcerData) {
      throw new Error(
        `指定された外注先の配置データが取得できませんでした。外注先KEY: ${outsourcerKey}`
      )
    }

    // 更新データを作成
    const updates = {
      [`${this.getOutsourcersPath(outsourcerKey)}/leavedAt`]: new Date(),
    }

    if (startTime !== null) {
      updates[`${this.getOutsourcersPath(outsourcerKey)}/startTime`] = startTime
    }

    if (endTime !== null) {
      updates[`${this.getOutsourcersPath(outsourcerKey)}/endTime`] = endTime
    }

    if (breakMinutes !== null) {
      updates[`${this.getOutsourcersPath(outsourcerKey)}/breakMinutes`] =
        breakMinutes
    }

    try {
      await update(ref(database), updates)
    } catch (error) {
      const message = `外注先KEY: ${outsourcerKey} の配置状態の更新に失敗しました。`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /***************************************************************************
   * 従業員の配置状態を `未確認` に更新します。
   * @param {string} employeeId - 従業員ID
   * @throws {Error} 指定された従業員の配置データが存在しない場合、
   *                 またはデータベース更新に失敗した場合にスローされます。
   ***************************************************************************/
  async unconfirmEmployee(employeeId) {
    // 現在の従業員データを取得
    const employeeData = this.data?.employees?.[employeeId]
    if (!employeeData) {
      throw new Error(
        `指定された従業員の配置データが取得できませんでした。従業員ID: ${employeeId}`
      )
    }

    // 更新データを作成
    const updates = {
      [`${this.getEmployeesPath(employeeId)}/confirmedAt`]: null,
      [`${this.getEmployeesPath(employeeId)}/arrivedAt`]: null,
      [`${this.getEmployeesPath(employeeId)}/leavedAt`]: null,
    }

    try {
      await update(ref(database), updates)
    } catch (error) {
      const message = `従業員ID: ${employeeId} の配置状態の更新に失敗しました。`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /***************************************************************************
   * 外注先の配置状態を `未確認` に更新します。
   *
   * @param {string} outsourcerKey - 外注先KEY
   * @throws {Error} 指定された外注先の配置データが存在しない場合、
   *                 またはデータベース更新に失敗した場合にスローされます。
   ***************************************************************************/
  async unconfirmOutsourcer(outsourcerKey) {
    // 現在の外注先データを取得
    const outsourcerData = this.data?.outsourcers?.[outsourcerKey]
    if (!outsourcerData) {
      throw new Error(
        `指定された外注先の配置データが取得できませんでした。外注先KEY: ${outsourcerKey}`
      )
    }

    // 更新データを作成
    const updates = {
      [`${this.getOutsourcersPath(outsourcerKey)}/confirmedAt`]: null,
      [`${this.getOutsourcersPath(outsourcerKey)}/arrivedAt`]: null,
      [`${this.getOutsourcersPath(outsourcerKey)}/leavedAt`]: null,
    }

    try {
      await update(ref(database), updates)
    } catch (error) {
      const message = `外注先KEY: ${outsourcerKey} の配置状態の更新に失敗しました。`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /**
   * Moves an employee within the `employeeOrder` array to a new position.
   * - Checks that both the old and new indices are within bounds.
   * - Reorders the employee list accordingly.
   *
   * @param {number} newIndex - The target index to move the employee to.
   * @param {number} oldIndex - The current index of the employee to move.
   * @throws Will throw an error if either `oldIndex` or `newIndex` is out of bounds.
   */
  async moveEmployee(newIndex, oldIndex) {
    // Clone the current employee order array
    const employeeOrder = [...(this.data?.employeeOrder || [])]

    // Validate indices
    if (
      oldIndex < 0 ||
      oldIndex >= employeeOrder.length ||
      newIndex < 0 ||
      newIndex >= employeeOrder.length
    ) {
      throw new Error(
        `The specified index is out of bounds. oldIndex: ${oldIndex}, newIndex: ${newIndex}`
      )
    }

    // Remove the employee from the old index and insert at the new index
    const [movedEmployee] = employeeOrder.splice(oldIndex, 1)
    employeeOrder.splice(newIndex, 0, movedEmployee)

    // Prepare the update object with the reordered employee list
    const updates = {
      [`${this.getEmployeeOrderPath()}`]: employeeOrder,
    }

    try {
      // Perform atomic update in Firebase
      await update(ref(database), updates)
    } catch (error) {
      const message = `Failed to move employee in the order list.`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /**
   * Moves an outsour within the `outsourcerOrder` array to a new position.
   * - Checks that both the old and new indices are within bounds.
   * - Reorders the outsour list accordingly.
   *
   * @param {number} newIndex - The target index to move the outsour to.
   * @param {number} oldIndex - The current index of the outsour to move.
   * @throws Will throw an error if either `oldIndex` or `newIndex` is out of bounds.
   */
  async moveOutsourcer(newIndex, oldIndex) {
    // Clone the current outsour order array
    const outsourcerOrder = [...(this.data?.outsourcerOrder || [])]

    // Validate indices
    if (
      oldIndex < 0 ||
      oldIndex >= outsourcerOrder.length ||
      newIndex < 0 ||
      newIndex >= outsourcerOrder.length
    ) {
      throw new Error(
        `The specified index is out of bounds. oldIndex: ${oldIndex}, newIndex: ${newIndex}`
      )
    }

    // Remove the outsour from the old index and insert at the new index
    const [movedOutsourcer] = outsourcerOrder.splice(oldIndex, 1)
    outsourcerOrder.splice(newIndex, 0, movedOutsourcer)

    // Prepare the update object with the reordered outsour list
    const updates = {
      [`${this.getOutsourcerOrderPath()}`]: outsourcerOrder,
    }

    try {
      // Perform atomic update in Firebase
      await update(ref(database), updates)
    } catch (error) {
      const message = `Failed to move outsour in the order list.`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }
}

export { Placement, PlacedEmployee, PlacedOutsourcer }
