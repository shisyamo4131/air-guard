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
 *
 * ### draggingItemについて:
 * - draggingItem は draggable コンポーネントの start イベントで生成される、
 *   employeeId, siteId, workShift から構成されるオブジェクトです。
 * - update:dragging-item イベントでこのオブジェクトを親コンポーネントに emit します。
 * - 同時に、このコンポーネントは props.draggingItem でこのオブジェクトを受け取ります。
 * - このコンポーネントは props.draggingItem の内容を確認し、自身が受け取ることのできない
 *   item を受け取ることができないよう、computed.acceptable で監視しています。
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
      // draggingItem が設定されていなければ true を返す
      if (!this.draggingItem) return true

      // draggingItem から各プロパティを取得
      const { employeeId, date, siteId, workShift } = this.draggingItem

      // 取得したプロパティのどれか1つでも取得できなければ false を返す
      if (!employeeId || !date || !siteId || !workShift) return false

      // employeeId が自身の employeeOrder に含まれていなければ true を返す
      // -> 自身の中で employeeId の重複が発生しないため
      if (!this.employeeOrder.includes(employeeId)) return true

      // date, siteId, workShift が一致していれば true を返す
      // -> そうでないと自身のアイテムを自身が受け付けられなくなってしまう
      return (
        this.date === date &&
        this.siteId === siteId &&
        this.workShift === workShift
      )
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
     * 同一日、同一勤務区分で複数の現場に配置されている従業員IDの配列を返します。
     * - 他現場の配置情報は Vuex の assignments を参照します。
     */
    employeeIdsWithMultipleSiteIds() {
      const assignments =
        this.$store.state.assignments.employees?.[this.date] || {}
      const result = []

      // Iterate over each employeeId and its assigned shifts
      for (const [employeeId, shifts] of Object.entries(assignments)) {
        // Check each work shift for multiple site IDs
        const isMultipleSites = Object.values(shifts).some(
          (siteId) => Object.keys(siteId).length > 1
        )
        if (isMultipleSites) result.push(employeeId)
      }

      return result
    },

    /**
     * 同一日、異なる勤務区分で複数配置されている従業員IDの配列を返します。
     * - 他現場の配置情報は Vuex の assignments を参照します。
     */
    employeeIdsWithDifferentWorkShifts() {
      const assignments =
        this.$store.state.assignments.employees?.[this.date] || {}
      const result = []

      // Iterate over each employeeId and its assigned shifts
      for (const [employeeId, shifts] of Object.entries(assignments)) {
        // Add to result if there are multiple work shifts
        if (Object.keys(shifts).length > 1) {
          result.push(employeeId)
        }
      }

      return result
    },

    /**
     * Vuex.site-order から適用すべき site-contract を取得して返します。
     * - 該当するものがなければ undefined を返します。
     */
    siteContract() {
      return this.$store.getters['site-order/siteContract']({
        date: this.date,
        siteId: this.siteId,
        workShift: this.workShift,
      })
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
      this.$emit('update:dragging-item', {
        employeeId: this.employeeOrder[index],
        date: this.date,
        siteId: this.siteId,
        workShift: this.workShift,
      })
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

    /**
     * 従業員追加ボタンがクリックされた時の処理です。
     * - active-cell イベントで自身を特定するためのオブジェクトを emit します。
     * - click:addEmployee イベント emit します。
     */
    onClickAddEmployee() {
      this.$emit('active-cell', {
        date: this.date,
        siteId: this.siteId,
        workShift: this.workShift,
      })
      this.$nextTick(() => this.$emit('click:addEmployee'))
    },

    /**
     * 複数の従業員を一括で配置します。
     * - 当該コンポーネントでは使用していません。
     * - 親コンポーネントから実行されます。
     */
    async addBulk(employeeIds) {
      await this.placement.employee.addBulk({
        employeeIds,
        siteContract: this.siteContract,
      })
    },
  },
}
</script>

<template>
  <div style="height: 100%" class="py-1 d-flex flex-column">
    <div class="d-flex pb-1" style="gap: 4px">
      <v-btn depressed x-small @click="onClickAddEmployee">
        <v-icon small>mdi-account-plus</v-icon>
      </v-btn>
      <v-btn depressed x-small>
        <v-icon small>mdi-account-edit</v-icon>
      </v-btn>
      <v-btn depressed x-small>
        <v-icon small>mdi-account-remove</v-icon>
      </v-btn>
    </div>

    <draggable
      class="d-flex flex-column pa-2 flex-grow-1"
      :style="{
        border: `1px solid lightgray`,
        minHeight: '84px',
        gap: '8px',
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
              showExist:
                employeeId === draggingItem?.employeeId &&
                date === draggingItem?.date &&
                (siteId !== draggingItem?.siteId ||
                  workShift !== draggingItem?.workShift),
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
