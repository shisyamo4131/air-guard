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
 *    |           |- employeeId: 'emp123'
 *    |           |- startTime: '08:00'
 *    |           |- endTime: '17:00'
 *    |           |- breakMinutes: 60
 *    |           |- arrivedAt: timestamp
 *    |           |- leavedAt: timestamp
 *    |           |- temperature: 36.5
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
import {
  ref,
  onValue,
  update,
  query,
  child,
  orderByKey,
  startAt,
  endAt,
  set,
} from 'firebase/database'

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
      addBulk: this.addBulk.bind(this), // Bind addBulk method to employee property for easy access
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
  async addBulk({ employeeIds = [], siteContract = null } = {}) {
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
  async add({ employeeId, index = null, siteContract = null } = {}) {
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
  async remove(employeeId) {
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
  async arrive(employeeId, temperature, startTime = null) {
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
  async resetArrival(employeeId) {
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
  async leave(
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
  async resetLeave(employeeId) {
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
  async move(newIndex, oldIndex) {
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

/**
 * The AssignmentsMonitor class manages real-time subscriptions to assignment data
 * from the Firebase Realtime Database. It listens for changes in assignment records
 * for both employees and sites, updating stored data in real-time.
 *
 * Key Responsibilities:
 * - Subscribe to and unsubscribe from real-time assignment data within a specified key range.
 * - Track and store assignment data for employees and sites in `employees` and `sites` properties.
 * - Maintain data consistency by ensuring that real-time updates are reflected
 *   in the properties and that subscriptions are efficiently managed.
 *
 * This class facilitates synchronized, live monitoring of assignment data,
 * making it accessible for real-time operations and analysis.
 */
class AssignmentsMonitor {
  // An object holding listeners for employees and sites data.
  #listeners = { employees: null, sites: null }

  constructor() {
    // Properties to store current assignment data for employees and sites.
    this.employees = {}
    this.sites = {}
  }

  /**
   * Provides the reference to the 'Placements/assignments' path in the Realtime Database.
   * @returns {DatabaseReference} The database reference for the assignments path.
   */
  get dbRef() {
    return ref(database, `Placements/assignments`)
  }

  /**
   * Subscribes to real-time assignment data within the specified key range.
   * Sets up real-time listeners for employee and site assignments between `from` and `to`.
   *
   * @param {string} from - The starting key for the data range to subscribe.
   * @param {string} to - The ending key for the data range to subscribe.
   */
  subscribe(from, to) {
    // Unsubscribe from any existing listeners before setting new ones
    this.unsubscribe()
    try {
      // Set up queries with the specified range for employees and sites
      const employeesQuery = query(
        child(this.dbRef, 'employees'),
        orderByKey(),
        startAt(from),
        endAt(to)
      )
      const sitesQuery = query(
        child(this.dbRef, 'sites'),
        orderByKey(),
        startAt(from),
        endAt(to)
      )

      // Set real-time listener for employees assignment data
      this.#listeners.employees = onValue(employeesQuery, (snapshot) => {
        const data = snapshot.val()
        // Update employees data or set as empty object if no data exists
        this.employees = data && typeof data === 'object' ? data : {}
      })

      // Set real-time listener for sites assignment data
      this.#listeners.sites = onValue(sitesQuery, (snapshot) => {
        const data = snapshot.val()
        // Update sites data or set as empty object if no data exists
        this.sites = data && typeof data === 'object' ? data : {}
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to subscribe to assignment data:', error)
      throw new Error('Subscription failed due to a database error.')
    }
  }

  /**
   * Unsubscribes from all active real-time assignment listeners.
   * Resets stored data and listener properties to null, ensuring cleanup.
   */
  unsubscribe() {
    try {
      // Unsubscribe from each listener and reset its reference
      Object.keys(this.#listeners).forEach((key) => {
        if (this.#listeners[key]) {
          this.#listeners[key]() // Detach the listener
          this.#listeners[key] = null
        }
      })
      // Reset stored data properties
      this.employees = {}
      this.sites = {}
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to unsubscribe from assignment data:', error)
      throw new Error('Unsubscription failed due to an unexpected error.')
    }
  }
}

/**
 * The SiteOrderMonitor class manages real-time monitoring and updates for site order data
 * in the Firebase Realtime Database. It allows subscription to live data updates, as well
 * as adding, removing, and updating entries in the site order.
 *
 * Key Responsibilities:
 * - Subscribe to and unsubscribe from the site order data in real-time.
 * - Add and remove site/workshift combinations to/from the site order list.
 * - Update the site order list with a new array of values.
 *
 * This class provides efficient and synchronized management of site order data,
 * facilitating real-time operations and consistency across applications.
 */
class SiteOrderMonitor {
  #listener = null

  constructor() {
    // Property to hold the current list of siteWorkShift IDs
    this.data = []
  }

  /**
   * Provides the reference to the 'Placements/siteOrder' path in the Realtime Database.
   * @returns {DatabaseReference} The database reference for the site order path.
   */
  get dbRef() {
    return ref(database, `Placements/siteOrder`)
  }

  /**
   * Subscribes to real-time updates for site order data.
   * Sets up a real-time listener that updates `this.data` with the latest site order array.
   */
  subscribe() {
    try {
      this.#listener = onValue(this.dbRef, (snapshot) => {
        const data = snapshot.val()
        // Update `data` with the retrieved array or set as an empty array if none exists
        this.data = Array.isArray(data) ? data : []
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to subscribe to site order data:', error)
      throw new Error('Subscription failed due to a database error.')
    }
  }

  /**
   * Unsubscribes from the real-time listener for site order data.
   * Resets the listener property to null.
   */
  unsubscribe() {
    try {
      if (this.#listener) this.#listener() // Detach the listener if set
      this.#listener = null
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to unsubscribe from site order data:', error)
    }
  }

  /**
   * Adds a new site/workshift combination to the site order if it does not already exist.
   *
   * @param {string} siteId - The ID of the site to add.
   * @param {string} workShift - The work shift ('day' or 'night') to add.
   * @throws {TypeError} Throws if `siteId` or `workShift` is not a string.
   */
  async add(siteId, workShift) {
    if (typeof siteId !== 'string' || typeof workShift !== 'string') {
      throw new TypeError('Arguments "siteId" and "workShift" must be strings.')
    }

    const id = `${siteId}-${workShift}`
    try {
      // Only add if the combination is not already present
      if (!this.data.some((item) => item.id === id)) {
        const updatedIndex = [...this.data, { id, siteId, workShift }]
        await set(this.dbRef, updatedIndex)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to add new id "${id}":`, error)
      throw new Error(`Failed to add new id "${id}": ${error.message}`)
    }
  }

  /**
   * Removes a site/workshift combination from the site order if it exists.
   *
   * @param {string} siteId - The ID of the site to remove.
   * @param {string} workShift - The work shift ('day' or 'night') to remove.
   * @throws {TypeError} Throws if `siteId` or `workShift` is not a string.
   */
  async remove(siteId, workShift) {
    if (typeof siteId !== 'string' || typeof workShift !== 'string') {
      throw new TypeError('Arguments "siteId" and "workShift" must be strings.')
    }

    const id = `${siteId}-${workShift}`
    try {
      // Filter out the specified key to update the index
      const updatedIndex = this.data.filter((item) => item.id !== id)
      await set(this.dbRef, updatedIndex)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to remove id "${id}":`, error)
      throw new Error(`Failed to remove id "${id}": ${error.message}`)
    }
  }

  /**
   * Updates the entire site order list with a new array of values.
   *
   * @param {Array} val - The new array to replace the current site order.
   * @throws {TypeError} Throws if `val` is not an array.
   */
  async update(val) {
    if (!Array.isArray(val)) {
      throw new TypeError('Argument "val" must be an array.')
    }

    try {
      await set(this.dbRef, val)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update site order list:', error)
      throw new Error(`Failed to update site order list: ${error.message}`)
    }
  }
}

export { Placement, AssignmentsMonitor, SiteOrderMonitor }
