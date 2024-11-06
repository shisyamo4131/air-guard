<script>
/**
 * ## GPlacementDraggableCell
 *
 * 配置管理で、特定の日付、現場、勤務区分における従業員または外注先の配置情報を管理するためのコンポーネントです。
 *
 * ### イベント
 * - click:schedule イベントで当該コンポーネントが管理している SiteOperationSchedule インスタンスを emit します。
 * - `update:dragging-item` : 親コンポーネントへ draggingItem を emit します。
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
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
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
     */
    group: { type: Object, required: true },
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
      fab: false,
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
     * Retrieves the outsourcerOrder from the Realtime Database.
     */
    outsourcerOrder() {
      return this.placement?.data?.outsourcerOrder || []
    },

    /**
     * Retrieves the employees data from the Realtime Database.
     */
    employees() {
      return this.placement?.data?.employees || null
    },

    /**
     * Retrieves the outsourcers data from the Realtime Database.
     */
    outsourcers() {
      return this.placement?.data?.outsourcers || null
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

    /**
     * 配置した従業員数が必要人員数を満たしているかどうかを返します。
     * - 配置されている従業員数には外注先を含めます。
     * - 満たしていない場合 true を返します。
     */
    isLackedWorkers() {
      const required = this.siteOperationSchedule?.requiredWorkers || 0
      return required > this.placedAmount
    },

    /**
     * 配置されている人員数です。
     * - 人員数は従業員数 + 外注先数です。
     */
    placedAmount() {
      return this.employeeOrder.length + this.outsourcerOrder.length
    },

    /**
     * siteId, workShift, date に一致する SiteOperationSchedule インスタンスを
     * Vuex から取得して返します。
     * 存在しない場合は新しい SiteOperationSchedule インスタンスを生成して返します。
     * - インスタンス生成時、自身が管理する日付、現場ID、勤務区分を初期値として設定します。
     * - computed.siteContract が存在する場合は開始時刻、終了時刻も初期値として設定します。
     */
    siteOperationSchedule() {
      // Vuex から SiteOperationSchedule を取得
      const { date, siteId, workShift } = this.$props
      const getterKey = 'site-order/siteOperationSchedule'
      const instance = this.$store.getters[getterKey]({
        date,
        siteId,
        workShift,
      })
      return (
        instance ||
        new SiteOperationSchedule({
          dates: [date],
          siteId,
          workShift,
          startTime: this.siteContract?.startTime || '',
          endTime: this.siteContract?.endTime || '',
        })
      )
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
        // this.siteOperationSchedule.subscribe(`${siteId}-${date}-${workShift}`)
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
        // this.siteOperationSchedule.unsubscribe()
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
    createDraggingItem(event) {
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
    async onChangeEmployee(event) {
      try {
        const { added, moved, removed } = event
        if (added) await this.handleAddEmployee(added)
        if (moved) await this.hadleMoveEmployee(moved)
        if (removed) await this.handleRemoveEmployee(removed)
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
    async handleAddEmployee({ element, newIndex }) {
      await this.placement.employee.add({
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
    async hadleMoveEmployee({ newIndex, oldIndex }) {
      await this.placement.employee.move(newIndex, oldIndex)
    },

    /**
     * Removes an employee from the placement.
     * - Accepts an event object from draggable as the argument.
     * - Uses employeeId from the event to identify and remove the employee.
     */
    async handleRemoveEmployee({ element }) {
      await this.placement.employee.remove(element)
    },

    /**
     * Handles changes to the outsourcer order triggered by draggable events.
     * - Processes added, moved, or removed events to update the outsourcer order accordingly.
     * - Catches and logs any errors, displaying an alert with the error message if an error occurs.
     */
    async onChangeOutsourcer(event) {
      try {
        const { added, moved, removed } = event
        // if (added) await this.handleAddOutsourcer(added)
        if (added) {
          alert('ドラッグによる別現場への移動はできません。') // KEY にインデックスを使用するため D&D による追加は不可。
        }
        if (moved) await this.hadleMoveOutsourcer(moved)
        if (removed) await this.handleRemoveOutsourcer(removed)
      } catch (err) {
        console.error(err) // eslint-disable-line no-console
        alert(err.message)
      }
    },

    /**
     * 外注先を配置に追加します。
     * - draggable から提供されるオブジェクトを引数に受け取ります。
     * - draggable からの移動による追加処理となるため、element には outsourcerKey が設定されているはずです。
     * NOTE: KEY にインデックスを使用するため D&D による追加は不可。
     */
    // async handleAddOutsourcer({ element, newIndex }) {
    //   await this.placement.outsourcer.add({
    //     outsourcerKey: element,
    //     index: newIndex,
    //     siteContract: this.siteContract,
    //   })
    // },

    /**
     * Adjusts the order of outsourcers in the placement.
     * - Accepts an event object from draggable as the argument.
     * - Uses outsourcerId, newIndex, and oldIndex to reorder the outsourcers correctly.
     */
    async hadleMoveOutsourcer({ newIndex, oldIndex }) {
      await this.placement.outsourcer.move(newIndex, oldIndex)
    },

    /**
     * Removes an outsourcer from the placement.
     * - Accepts an event object from draggable as the argument.
     * - Uses outsourcerKey from the event to identify and remove the outsourcer.
     */
    async handleRemoveOutsourcer({ element }) {
      await this.placement.outsourcer.remove(element)
    },

    /**
     * 従業員の編集ボタンがクリックされた時の処理です。
     * - 編集対象の配置従業員のデータオブジェクトを受け取ります。
     * - 編集対象の配置従業員データのパスを生成し、配置従業員データオブジェクトとともに
     *   click:edit-employee イベントを emit します。
     */
    onClickEditEmployee(item) {
      const path = this.placement.getEmployeesPath(item.employeeId)
      this.$emit('click:edit-employee', structuredClone({ item, path }))
    },

    /**
     * 外注先の編集ボタンがクリックされた時の処理です。
     * - 編集対象の配置外注先データオブジェクトを受け取ります。
     * - 編集対象の配置外注先データのパスを生成し、配置外注先データオブジェクトとともに
     *   click:edit-outsourcer イベントを emit します。
     */
    onClickEditOutsourcer(item) {
      const path = this.placement.getOutsourcersPath(item.outsourcerKey)
      this.$emit('click:edit-outsourcer', structuredClone({ item, path }))
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
     * 外注先追加ボタンがクリックされた時の処理です。
     * - active-cell イベントで自身を特定するためのオブジェクトを emit します。
     * - click:addOutsourcer イベント emit します。
     */
    onClickAddOutsourcer() {
      this.$emit('active-cell', {
        date: this.date,
        siteId: this.siteId,
        workShift: this.workShift,
      })
      this.$nextTick(() => this.$emit('click:addOutsourcer'))
    },

    /**
     * 複数の従業員を一括で配置します。
     * - 当該コンポーネントでは使用していません。
     * - 親コンポーネントから実行されます。
     */
    async addBulkEmployees(employeeIds) {
      await this.placement.employee.addBulk({
        employeeIds,
        siteContract: this.siteContract,
      })
    },

    /**
     * 複数の外注先を一括で配置します。
     * - 当該コンポーネントでは使用していません。
     * - 親コンポーネントから実行されます。
     * - 単一の外注先を複数登録するメソッドです。
     */
    async addBulkOutsourcers(outsourcerId, length) {
      await this.placement.outsourcer.addBulk({
        outsourcerId,
        length,
        siteContract: this.siteContract,
      })
    },
  },
}
</script>

<template>
  <div style="height: 100%; position: relative" class="py-2 d-flex flex-column">
    <v-chip
      style="position: absolute; right: -12px; top: 4px; z-index: 1"
      :color="isLackedWorkers ? 'error' : 'info'"
      small
      @click="$emit('click:schedule', siteOperationSchedule)"
    >
      <v-icon v-if="siteOperationSchedule?.qualification" small left>
        mdi-star
      </v-icon>
      {{ placedAmount }}/{{ siteOperationSchedule?.requiredWorkers || '-' }}
    </v-chip>
    <v-speed-dial
      v-model="fab"
      style="position: absolute; bottom: 2px; right: -12px"
      direction="left"
      transition="slide-x-reverse-transition"
    >
      <template #activator>
        <v-btn v-model="fab" color="primary" fab x-small>
          <v-icon v-if="fab">mdi-close</v-icon>
          <v-icon v-else>mdi-plus</v-icon>
        </v-btn>
      </template>
      <v-btn color="indigo" dark fab x-small @click="onClickAddEmployee">
        <v-icon>mdi-account</v-icon>
      </v-btn>
      <v-btn color="secondary" fab x-small @click="onClickAddOutsourcer">
        <v-icon>mdi-handshake</v-icon>
      </v-btn>
    </v-speed-dial>
    <!-- メインコンテナ -->
    <div style="border: 1px solid lightgray" class="py-2 flex-grow-1">
      <!-- 従業員用 Draggable コンテナ -->
      <div class="d-flex flex-grow-1">
        <!-- 従業員用 Draggable コンポーネント -->
        <draggable
          class="d-flex flex-column pa-2 flex-grow-1"
          :style="{
            minHeight: '24px',
            gap: '8px',
          }"
          :value="employeeOrder"
          :disabled="!acceptable"
          :group="{ ...group, name: `employees-${group?.name || ''}` }"
          handle=".handle"
          v-bind="{ animation: 300 }"
          @start="createDraggingItem"
          @end="deleteDraggingItem"
          @change="onChangeEmployee"
        >
          <div v-for="employeeId of employeeOrder" :key="employeeId">
            <slot
              name="employees"
              v-bind="{
                attrs: {
                  employeeId,
                  date,
                  siteId,
                  workShift,
                  ellipsis,
                  startTime: employees?.[employeeId]?.startTime || '',
                  endTime: employees?.[employeeId]?.endTime || '',
                  showError: $store.getters[
                    'assignments/isEmployeeAssignedToMultipleSites'
                  ](date, employeeId),
                  showExist:
                    employeeId === draggingItem?.employeeId &&
                    date === draggingItem?.date &&
                    (siteId !== draggingItem?.siteId ||
                      workShift !== draggingItem?.workShift),
                  showContinuous: $store.getters[
                    'assignments/isEmployeeAssignedToDifferentShifts'
                  ](date, employeeId),
                },
                on: {
                  'click:edit': () =>
                    onClickEditEmployee(employees?.[employeeId] || null),
                  'click:remove': () =>
                    handleRemoveEmployee({ element: employeeId }),
                },
              }"
            />
          </div>
        </draggable>
      </div>
      <!-- 外注先用 Draggable コンテナ -->
      <div class="d-flex flex-grow-1">
        <!--
        外注先の Draggable コンポーネント
        - 外注先の KEY にインデックスを使用するため D&D による追加は不可能。
        - group.name を日付、現場、勤務区分で個別に設定して D&D による追加を回避。
      -->
        <draggable
          class="d-flex flex-column pa-2 flex-grow-1"
          :style="{
            minHeight: '24px',
            gap: '8px',
          }"
          :value="outsourcerOrder"
          :disabled="!acceptable"
          :group="{
            ...group,
            name: `outsourcers-${date}-${siteId}-${workShift}`,
          }"
          handle=".handle"
          v-bind="{ animation: 300 }"
          @change="onChangeOutsourcer"
        >
          <div v-for="outsourcerKey of outsourcerOrder" :key="outsourcerKey">
            <slot
              name="outsourcers"
              v-bind="{
                attrs: {
                  outsourcerKey,
                  date,
                  siteId,
                  workShift,
                  ellipsis,
                  startTime: outsourcers?.[outsourcerKey]?.startTime || '',
                  endTime: outsourcers?.[outsourcerKey]?.endTime || '',
                },
                on: {
                  'click:edit': () =>
                    onClickEditOutsourcer(outsourcers?.[outsourcerKey] || null),
                  'click:remove': () =>
                    handleRemoveOutsourcer({ element: outsourcerKey }),
                },
              }"
            />
          </div>
        </draggable>
      </div>
    </div>
  </div>
</template>

<style></style>
