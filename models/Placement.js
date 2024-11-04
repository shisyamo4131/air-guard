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
 *    |        |    |- arrivedAt: timestamp
 *    |        |    |- leavedAt: timestamp
 *    |        |    |- temperature: 36.5
 *    |        |- outsourcers
 *    |           |- ${outsoucerId}-${branch}
 *    |             |- outsoucerId: 'emp123'
 *    |             |- branch: ${branch}
 *    |             |- startTime: '08:00'
 *    |             |- endTime: '17:00'
 *    |             |- breakMinutes: 60
 *    |             |- arrivedAt: timestamp
 *    |             |- leavedAt: timestamp
 *    |- assignments
 *       |- employees
 *       |  |- ${date} (YYYY-MM-DD)
 *       |     |- ${employeeId}
 *       |        |- ${workShift} ('day' or 'night')
 *       |           |- ${siteId}
 *       |              |- siteId: 'site456'
 *       |- sites
 *       |  |- ${date} (YYYY-MM-DD)
 *             |- ${siteId}
 *                |- ${workShift} ('day' or 'night')
 *                   |- ${employeeId}
 *                      |- employeeId: 'emp123'
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

const ARRIVAL_ALLOWED_TIME_OFFSET = 60 * 60 * 1000

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
   * @param {Object} args.arrivedAt - The arrival time (timestamp).
   * @param {Object} args.leavedAt - The departure time (timestamp).
   * @param {number} args.temperature - The temperature recorded.
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
    this.startTime = startTime || ''
    this.endTime = endTime || ''
    this.breakMinutes = breakMinutes || null
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
      resetArrival: this.resetEmployeeArrival.bind(this),
      resetLeave: this.resetEmployeeLeave.bind(this),
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
   * Generates the path for employeeOrder under Placements for the current date, site, and shift.
   * @returns {string} The employeeOrder path in the Realtime Database.
   */
  getEmployeeOrderPath() {
    return `Placements/${this.date}/${this.siteId}/${this.workShift}/employeeOrder`
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
   * Generates the path for a site's assignment entry under Placements.
   * @param {string} employeeId - The employee's ID.
   * @returns {string} The assignment path for the site in the Realtime Database.
   */
  getAssignmentsSitesPath(employeeId) {
    return `Placements/assignments/sites/${this.date}/${this.siteId}/${this.workShift}/${employeeId}`
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
   * Adds multiple employees to the site in bulk.
   * - New employees are added to the end of `employeeOrder`.
   * @param {Object} options - Options for bulk employee addition.
   * @param {Array<string>} options.employeeIds - Array of employee IDs to add.
   * @param {Object|null} options.siteContract - Contract details for the site, including startTime, endTime, and breakMinutes.
   * @throws {TypeError} Throws if `employeeIds` is not an array or contains non-string elements.
   */
  async addEmployees({ employeeIds = [], siteContract = null } = {}) {
    // Validate that employeeIds is an array
    if (!Array.isArray(employeeIds)) {
      const message = `[addBulk] "employeeIds" must be an array. Provided: ${employeeIds}`
      throw new TypeError(message)
    }

    // Check if employeeIds array is empty
    if (employeeIds.length === 0) {
      // eslint-disable-next-line no-console
      console.warn(`[addBulk] "employeeIds" array is empty.`)
      return
    }

    // Validate that each element in employeeIds is a string
    for (const employeeId of employeeIds) {
      if (typeof employeeId !== 'string') {
        const message = `[addBulk] "employeeIds" contains non-string values. Provided: ${employeeIds}`
        throw new TypeError(message)
      }
    }

    const employeeOrder = this.data?.employeeOrder || []
    const updates = {}

    employeeIds.forEach((employeeId) => {
      if (!employeeOrder.includes(employeeId)) {
        // Create a new PlacedEmployee instance with provided contract details
        const newEmployee = new PlacedEmployee({
          employeeId,
          startTime: siteContract?.startTime || null,
          endTime: siteContract?.endTime || null,
          breakMinutes: siteContract?.breakMinutes || null,
        })
        employeeOrder.push(employeeId)

        // Populate the updates object with the new employee's data
        updates[this.getEmployeesPath(employeeId)] = newEmployee.toObject()
        updates[`${this.getAssignmentsEmployeesPath(employeeId)}/siteId`] =
          this.siteId
        updates[`${this.getAssignmentsSitesPath(employeeId)}/employeeId`] =
          employeeId
      }
    })

    // Update employee order in the database
    updates[this.getEmployeeOrderPath()] = employeeOrder

    // Perform an atomic update in the database with error handling
    try {
      await update(ref(database), updates)
      // eslint-disable-next-line no-console
      console.info(`[addBulk] Successfully added bulk employees.`)
    } catch (error) {
      const message = `[addBulk] Failed to update the database with new placement entries.`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /**
   * Adds a new placement entry to the Realtime Database.
   * - Adds the employee ID to `employeeOrder`.
   * - Adds placement details to `employees`.
   * - Registers employee assignment in `assignmentsEmployeesPath`.
   * - Registers site assignment in `assignmentsSitesPath`.
   *
   * @param {Object} args - The placement arguments.
   * @param {string} args.employeeId - The employee's ID.
   * @param {number|null} [args.index=null] - The position in `employeeOrder` where the employee ID should be added.
   * @param {Object} [args.siteContract=null] - Details of the employee's shift (startTime, endTime, breakMinutes).
   * @throws Will throw an error if `employeeId` is not provided or is not a string, or if the employee already exists in `employeeOrder`.
   */
  async addEmployee({ employeeId, index = null, siteContract = null } = {}) {
    // Validate employeeId
    if (!employeeId || typeof employeeId !== 'string') {
      const message = `employeeId must be specified as a string. Received ${employeeId}`
      console.error(message) // eslint-disable-line no-console
      throw new Error(message)
    }

    const employeeOrder = this.data?.employeeOrder || []

    // Check if the employee is already in employeeOrder
    if (employeeOrder.includes(employeeId)) {
      const message = `Specified employee already exists. employeeId: ${employeeId}`
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
      startTime: siteContract?.startTime || null,
      endTime: siteContract?.endTime || null,
      breakMinutes: siteContract?.breakMinutes || null,
    })

    // Prepare an atomic update object for the database
    const updates = {
      [`${this.getEmployeeOrderPath()}`]: employeeOrder,
      [`${this.getEmployeesPath(employeeId)}`]: newEmployee.toObject(),
      [`${this.getAssignmentsEmployeesPath(employeeId)}/siteId`]: this.siteId,
      [`${this.getAssignmentsSitesPath(employeeId)}/employeeId`]: employeeId,
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
        [`${this.getAssignmentsSitesPath(employeeId)}/employeeId`]: null, // Clear site assignment for the employee
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
   * Records the arrival of an employee at the specified start time and logs their temperature.
   * - Ensures the temperature is a valid number.
   * - Checks if the employee exists in the data.
   * - Verifies that the employee has not already been marked as arrived.
   * - Ensures arrival time is within an acceptable time window.
   *
   * @param {string} employeeId - The ID of the employee arriving.
   * @param {number} temperature - The recorded temperature of the employee.
   * @param {string|null} [startTime=null] - Optional new start time for the employee (format: HH:MM).
   * @throws Will throw an error if the temperature is invalid, employee data is missing, or arrival is recorded too early.
   */
  async arriveEmployee(employeeId, temperature, startTime = null) {
    // Validate that temperature is provided and is a valid number
    if (typeof temperature !== 'number' || isNaN(temperature)) {
      throw new TypeError(
        'Temperature is required and must be specified as a valid number.'
      )
    }

    // Retrieve current employee data
    const currentEmployeeData = this.data?.employees?.[employeeId]
    if (!currentEmployeeData) {
      throw new Error(`Employee ID not found: ${employeeId}`)
    }

    // Check if the employee already has an arrival record
    if (currentEmployeeData.arrivedAt) {
      throw new Error(
        `Employee ID ${employeeId} already has an arrival record.`
      )
    }

    // Determine start date and effective start time
    const startDate = this.date
    const effectiveStartTime = startTime || currentEmployeeData.startTime
    if (!startDate || !effectiveStartTime) {
      throw new Error('Date or start time is invalid.')
    }

    // Calculate the allowed time window for arrival
    const baseTime = new Date(`${startDate}T${effectiveStartTime}:00.000Z`)
    const allowedTime = new Date(
      baseTime.getTime() - ARRIVAL_ALLOWED_TIME_OFFSET
    )
    const currentTime = new Date()

    // Validate that current time is within the allowed window
    if (currentTime < allowedTime) {
      throw new Error(
        'Arrival recording is allowed starting one hour before shift start time.'
      )
    }

    // Prepare the data for updating the employee's arrival status
    const currentTimeISO = currentTime.toISOString()
    const updates = {
      [`${this.getEmployeesPath(employeeId)}/arrivedAt`]: currentTimeISO,
      [`${this.getEmployeesPath(employeeId)}/temperature`]: temperature,
    }

    // Update startTime if a new start time is provided and differs from the current one
    if (startTime && startTime !== currentEmployeeData.startTime) {
      updates[`${this.getEmployeesPath(employeeId)}/startTime`] = startTime
    }

    try {
      // Perform atomic update in the database
      await update(ref(this.database), updates)
    } catch (error) {
      const message = `Failed to record arrival for employeeId: ${employeeId}.`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /**
   * Resets the arrival record for a specified employee.
   * - Clears the `arrivedAt` timestamp for the employee, if no leave record exists.
   * - Ensures that the employee's data is present and no departure (`leavedAt`) record exists.
   *
   * @param {string} employeeId - The ID of the employee whose arrival information is being reset.
   * @throws Will throw an error if the employee data is not found or if a departure record exists.
   */
  async resetEmployeeArrival(employeeId) {
    try {
      // Retrieve the current employee data
      const currentEmployeeData = this.data?.employees?.[employeeId]

      // Check if employee data exists
      if (!currentEmployeeData) {
        throw new Error(`Employee ID not found: ${employeeId}`)
      }

      // Ensure that the employee has not already recorded a departure
      if (currentEmployeeData.leavedAt) {
        throw new Error(
          `Employee ID ${employeeId} already has a departure record. Arrival reset is not allowed.`
        )
      }

      // Prepare the update object to reset arrival details
      const updates = {
        [`${this.getEmployeesPath(employeeId)}/arrivedAt`]: null,
      }

      // Perform atomic update in Firebase
      await update(ref(this.database), updates)
    } catch (error) {
      const message = `Failed to reset arrival information for employeeId: ${employeeId}.`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /**
   * Records the departure of an employee, updating end time, break minutes, and other details as needed.
   * - Checks that the employee exists and has an arrival record.
   * - Updates `leavedAt` with the current time.
   * - Optionally updates `startTime`, `endTime`, and `breakMinutes` if new values are provided.
   *
   * @param {string} employeeId - The ID of the employee leaving.
   * @param {string|null} [startTime=null] - Optional start time for the shift (format: HH:MM).
   * @param {string|null} [endTime=null] - Optional end time for the shift (format: HH:MM).
   * @param {number|null} [breakMinutes=null] - Optional break duration in minutes.
   * @throws Will throw an error if the employee is not found or has no arrival record.
   */
  async leaveEmployee(
    employeeId,
    startTime = null,
    endTime = null,
    breakMinutes = null
  ) {
    // Retrieve employee data from this.data
    const currentEmployeeData = this.data?.employees?.[employeeId]

    // Check if the employee exists
    if (!currentEmployeeData) {
      throw new Error(`Employee ID not found: ${employeeId}`)
    }

    // Ensure the employee has an arrival record before recording departure
    if (!currentEmployeeData.arrivedAt) {
      throw new Error(
        `Employee ID ${employeeId} has no arrival record and cannot be marked as left.`
      )
    }

    // Get the current time in ISO 8601 format for leavedAt
    const currentTimeISO = new Date().toISOString()

    // Create the update object (leavedAt, startTime, endTime, breakMinutes)
    const updates = {
      [`${this.getEmployeesPath(employeeId)}/leavedAt`]: currentTimeISO,
    }

    // Update startTime if provided and different from the current startTime
    if (startTime && startTime !== currentEmployeeData.startTime) {
      updates[`${this.getEmployeesPath(employeeId)}/startTime`] = startTime
    }

    // Update endTime if provided and different from the current endTime
    if (endTime && endTime !== currentEmployeeData.endTime) {
      updates[`${this.getEmployeesPath(employeeId)}/endTime`] = endTime
    }

    // Update breakMinutes if provided and different from the current breakMinutes
    if (
      breakMinutes !== null &&
      breakMinutes !== currentEmployeeData.breakMinutes
    ) {
      updates[`${this.getEmployeesPath(employeeId)}/breakMinutes`] =
        breakMinutes
    }

    try {
      // Perform atomic update to Firebase
      await update(ref(this.database), updates)
    } catch (error) {
      const message = `Failed to record departure for employeeId: ${employeeId}.`
      console.error(message, error) // eslint-disable-line no-console
      throw new Error(`${message} ${error.message}`)
    }
  }

  /**
   * Resets the leave information for a specified employee.
   * - Clears the `leavedAt` timestamp for the employee.
   * - Resets `endTime` and `breakMinutes` to default values based on site contract if available.
   *
   * @param {string} employeeId - The ID of the employee whose leave information is being reset.
   * @throws Will throw an error if the employee data is not found.
   */
  async resetEmployeeLeave(employeeId) {
    // Retrieve current employee data
    const currentEmployeeData = this.data?.employees?.[employeeId]
    if (!currentEmployeeData) {
      throw new Error(`Employee ID not found: ${employeeId}`)
    }

    // Prepare the update object to reset leave details
    const updates = {
      [`${this.getEmployeesPath(employeeId)}/leavedAt`]: null,
      [`${this.getEmployeesPath(employeeId)}/endTime`]:
        this.siteContract?.endTime || null,
      [`${this.getEmployeesPath(employeeId)}/breakMinutes`]:
        this.siteContract?.breakMinutes || 0,
    }

    // Perform atomic update in Firebase with error handling
    try {
      await update(ref(this.database), updates)
    } catch (error) {
      const message = `Failed to reset leave information for employeeId: ${employeeId}.`
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
}

export { Placement }
