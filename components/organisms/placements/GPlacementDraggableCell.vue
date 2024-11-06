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
 *   employeeId, date, siteId, workShift から構成されるオブジェクトです。
 * - update:dragging-item イベントでこのオブジェクトを親コンポーネントに emit します。
 * - 同時に、このコンポーネントは props.draggingItem でこのオブジェクトを受け取ります。
 */
import GPlacementActionSpeedDial from './GPlacementActionSpeedDial.vue'
import GPlacementScheduleChip from './GPlacementScheduleChip.vue'
import GPlacementDraggableEmployeeList from './GPlacementDraggableEmployeeList.vue'
import GPlacementDraggableOutsourcerList from './GPlacementDraggableOutsourcerList.vue'
import { Placement } from '~/models/Placement'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GPlacementActionSpeedDial,
    GPlacementScheduleChip,
    GPlacementDraggableEmployeeList,
    GPlacementDraggableOutsourcerList,
  },

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
      const func = this.placement.employee.addBulk
      await func({ employeeIds, siteContract: this.siteContract })
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
    <!-- 配置人数Chipコンポーネント -->
    <g-placement-schedule-chip
      style="position: absolute; right: -12px; top: 4px; z-index: 1"
      :placement="placement"
      :site-operation-schedule="siteOperationSchedule"
      small
      @click="$emit('click:schedule', siteOperationSchedule)"
    />

    <!-- アクション スピードダイヤル -->
    <g-placement-action-speed-dial
      style="position: absolute; bottom: 2px; right: -12px"
      @click:add-employee="onClickAddEmployee"
      @click:add-outsourcer="onClickAddOutsourcer"
    />

    <!-- メインコンテナ -->
    <div style="border: 1px solid lightgray" class="py-2 flex-grow-1">
      <!-- 従業員用 Draggable コンポーネント -->
      <g-placement-draggable-employee-list
        :dragging-item="draggingItem"
        :ellipsis="ellipsis"
        :group="group"
        :placement="placement"
        @update:dragging-item="$emit('update:dragging-item', $event)"
        @click:edit="$emit('click:edit-employee', $event)"
      >
        <template #employees="props">
          <slot name="employees" v-bind="props" />
        </template>
      </g-placement-draggable-employee-list>
      <!--
        外注先の Draggable コンポーネント
        - 外注先の KEY にインデックスを使用するため D&D による追加は不可能。
        - group.name を日付、現場、勤務区分で個別に設定して D&D による追加を回避。
      -->
      <g-placement-draggable-outsourcer-list
        :ellipsis="ellipsis"
        :placement="placement"
        @click:edit="$emit('click:edit-outsourcer', $event)"
      >
        <template #outsourcers="props">
          <slot name="outsourcers" v-bind="props" />
        </template>
      </g-placement-draggable-outsourcer-list>
    </div>
  </div>
</template>

<style></style>
