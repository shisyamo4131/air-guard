<script>
/**
 * GPlacementCell
 *
 * A component for managing employee placement information for a specified date, site, and work shift.
 * Uses vue-draggable as the root component, allowing it to:
 * - Accept new employee placements from external components
 * - Reorder employees placed within this component
 *
 * Synchronizes with the Realtime Database using the Placement class.
 *
 * Provides a slot for displaying information about the placed employees.
 */
import draggable from 'vuedraggable'
import { Placement } from '~/models/Placement'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { draggable },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * Receives data from Placements/assignments/employees/${date}.
     * - Used to check for employee assignments on the same date and work shift, and to verify continuous work status.
     */
    assignments: { type: Object, default: () => ({}) },
    /**
     * The target date in YYYY-MM-DD format.
     */
    date: { type: String, required: true },
    /**
     * The target site ID.
     */
    siteId: { type: String, required: true },
    /**
     * The target work shift.
     */
    workShift: { type: String, required: true },
    /**
     * Options for the draggable component's group.
     * - By default, the group name is set to 'employeeId'.
     */
    group: { type: Object, default: () => ({ name: 'employeeId' }) },
    /**
     * Receives an object with properties employeeId, siteId, and workShift.
     * - Used to determine whether the dragged object can be accepted.
     * - Can be synced with the parent component using the .sync modifier.
     */
    draggingItem: { type: Object, default: null },
    /**
     * Enables abbreviated display if set to true.
     */
    ellipsis: { type: Boolean, default: false },
    /**
     * Array of site contract information.
     * - No filtering by site or work shift is required; relevant data is extracted within the component as needed.
     * - If applicable contract information exists, it sets start and end times when assigning employees.
     */
    siteContracts: { type: Array, default: () => [] },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * Variable to store an instance of the Placement class.
       */
      placement: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * Determines if the component can accept a drop based on props.draggingItem.
     * - Returns true if draggingItem.employeeId is not in employeeOrder.
     * - Returns true if both draggingItem.siteId and draggingItem.workShift match the component's corresponding props.
     *   -> This condition prevents the component from rejecting its own item upon dragging.
     */
    acceptable() {
      // Accepts unconditionally if draggingItem does not exist
      if (!this.draggingItem) return true

      // Extract individual properties from draggingItem
      const { employeeId, siteId, workShift } = this.draggingItem

      // Reject if employeeId is not present
      if (!employeeId) return false

      // Returns true if employeeId is not in the component's employeeOrder
      // -> Ensures no duplicate employeeId on the same day and work shift
      if (!this.employeeOrder.includes(employeeId)) return true

      // Returns true if either siteId or workShift is missing
      if (!siteId || !workShift) return true

      // Checks if both siteId and workShift match the component's props
      return this.siteId === siteId && this.workShift === workShift
    },

    /**
     * Retrieves the employeeOrder from the Realtime Database.
     */
    employeeOrder() {
      return this.placement?.data?.employeeOrder || []
    },

    /**
     * Retrieves the employees data from the Realtime Database.
     */
    employees() {
      return this.placement?.data?.employees || null
    },

    /**
     * Returns an array of employee IDs assigned to multiple sites within the same work shift.
     */
    employeeIdsWithMultipleSiteIds() {
      const result = []

      // Iterate over each employeeId and its assigned shifts
      for (const [employeeId, shifts] of Object.entries(this.assignments)) {
        // Check each work shift for multiple site IDs
        const isMultipleSites = Object.values(shifts).some(
          (siteId) => Object.keys(siteId).length > 1
        )
        if (isMultipleSites) result.push(employeeId)
      }

      return result
    },

    /**
     * Returns an array of employee IDs assigned to multiple work shifts.
     */
    employeeIdsWithDifferentWorkShifts() {
      const result = []

      // Iterate over each employeeId and its assigned shifts
      for (const [employeeId, shifts] of Object.entries(this.assignments)) {
        // Add to result if there are multiple work shifts
        if (Object.keys(shifts).length > 1) {
          result.push(employeeId)
        }
      }

      return result
    },

    /**
     * Retrieves the applicable site contract from props.siteContracts.
     * - Filters contracts by matching siteId and workShift with component props.
     * - Sorts the filtered contracts in descending order by startDate.
     * - Returns the most recent applicable contract if found; otherwise, returns undefined.
     */
    siteContract() {
      return this.siteContracts
        .filter(
          ({ siteId, workShift }) =>
            siteId === this.siteId && workShift === this.workShift
        )
        .sort((a, b) => b.startDate - a.startDate) // Sort by startDate in descending order
        .find(({ startDate }) => startDate <= this.date)
    },
  },

  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    /**
     * Registers a watcher for the combination of props: date, siteId, and workShift.
     * - When all values are set, it instantiates the Placement class and starts subscribing to Placement information.
     * - If any of the values are missing, the subscription process is skipped.
     */
    this.$watch(
      () => [this.date, this.siteId, this.workShift],
      () => this.subscribe(),
      { immediate: true }
    )
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * Subscribes to placement data for the specified date, site, and work shift.
     * - First, any existing subscription is canceled.
     * - If date, siteId, or workShift is missing, subscription is skipped.
     * - Otherwise, a new Placement instance is created and subscribed to.
     * - Catches and logs any errors, displaying an alert with the error message if an error occurs.
     */
    subscribe() {
      try {
        // Unsubscribe from any existing Placement instance before creating a new one
        this.unsubscribe()
        const { date, siteId, workShift } = this.$props
        if (!date || !siteId || !workShift) return
        this.placement = new Placement({ date, siteId, workShift })
        this.placement.subscribe()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        alert(err.message)
      }
    },

    /**
     * Unsubscribes from the current Placement instance if it exists, and resets it to null.
     * - Catches and logs any errors, displaying an alert with the error message if an error occurs.
     */
    unsubscribe() {
      try {
        if (this.placement) this.placement.unsubscribe()
        this.placement = null
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        alert(err.message)
      }
    },

    /**
     * Event handler for the start of a drag action.
     * - Emits an update:dragging-item event.
     */
    createGraggingItem(event) {
      const index = event.oldIndex
      const employeeId = this.employeeOrder[index]
      const siteId = this.siteId
      const workShift = this.workShift
      this.$emit('update:dragging-item', { employeeId, siteId, workShift })
    },

    /**
     * Event handler for the end of a drag action.
     * - Emits an update:dragging-item event to reset dragging state.
     */
    deleteDraggingItem() {
      this.$emit('update:dragging-item', null)
    },

    /**
     * Handles changes to the employee order triggered by draggable events.
     * - Processes added, moved, or removed events to update the employee order accordingly.
     * - Catches and logs any errors, displaying an alert with the error message if an error occurs.
     */
    async onChange(event) {
      try {
        const { added, moved, removed } = event
        if (added) await this.handleAdd(added)
        if (moved) await this.handleMove(moved)
        if (removed) await this.handleRemove(removed)
      } catch (err) {
        console.error(err) // eslint-disable-line no-console
        alert(err.message)
      }
    },

    /**
     * Adds an employee to the placement.
     * - Accepts an event object from draggable as the argument.
     * - Uses employeeId, index, and siteContract to add the employee in the correct position with contract details.
     */
    async handleAdd({ element, newIndex }) {
      await this.placement.add({
        employeeId: element,
        index: newIndex,
        siteContract: this.siteContract,
      })
    },

    /**
     * Adjusts the order of employees in the placement.
     * - Accepts an event object from draggable as the argument.
     * - Uses employeeId, newIndex, and oldIndex to reorder the employees correctly.
     */
    async handleMove({ newIndex, oldIndex }) {
      await this.placement.move(newIndex, oldIndex)
    },

    /**
     * Removes an employee from the placement.
     * - Accepts an event object from draggable as the argument.
     * - Uses employeeId from the event to identify and remove the employee.
     */
    async handleRemove({ element }) {
      await this.placement.remove(element)
    },

    /**
     * Emits an event to initiate editing for the specified employee.
     * - Retrieves the employee data path using the employeeId.
     * - Passes a cloned object containing the data path and employee data to the parent component to avoid direct mutations.
     */
    onClickEdit(item) {
      const path = this.placement.getEmployeesPath(item.employeeId)
      this.$emit('click:edit', structuredClone({ path, item }))
    },
  },
}
</script>

<template>
  <div>
    <!-- <div class="d-flex">
      <v-btn icon small color="primary">
        <v-icon>mdi-account-plus</v-icon>
      </v-btn>
      <v-btn icon small color="primary">
        <v-icon>mdi-account-edit</v-icon>
      </v-btn>
    </div> -->
    <draggable
      class="placement-cell"
      :style="{
        backgroundColor: !acceptable ? 'gray' : 'transparent',
      }"
      :value="employeeOrder"
      :disabled="!acceptable"
      :group="group"
      @start="createGraggingItem"
      @end="deleteDraggingItem"
      @change="onChange"
    >
      <div v-for="employeeId of employeeOrder" :key="employeeId">
        <slot
          name="default"
          v-bind="{
            attrs: {
              employeeId,
              date,
              siteId,
              workShift,
              ellipsis,
              startTime: employees?.[employeeId]?.startTime || '',
              endTime: employees?.[employeeId]?.endTime || '',
              showError: employeeIdsWithMultipleSiteIds.includes(employeeId),
              showContinuous:
                employeeIdsWithDifferentWorkShifts.includes(employeeId),
            },
            on: {
              'click:edit': () => onClickEdit(employees?.[employeeId] || null),
              'click:remove': () => handleRemove({ element: employeeId }),
            },
          }"
        />
      </div>
    </draggable>
  </div>
</template>

<style></style>
