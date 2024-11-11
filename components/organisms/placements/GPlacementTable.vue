<script>
/**
 * GPlacementTable
 *
 * 配置管理用のテーブルコンポーネントです。
 *
 * @author shisyamo4131
 */
import ja from 'dayjs/locale/ja'
import GPlacementDraggableCell from './GPlacementDraggableCell.vue'
import GPlacementSiteOperationScheduleEditDialog from './GPlacementSiteOperationScheduleEditDialog.vue'
import GPlacementEmployeePlacementEditDialog from './GPlacementEmployeePlacementEditDialog.vue'
import GPlacementOutsourcerPlacementEditDialog from './GPlacementOutsourcerPlacementEditDialog.vue'
import GPlacementSiteOperationSchedulesDialog from './GPlacementSiteOperationSchedulesDialog.vue'
import GDialogEmployeeSelector from '~/components/molecules/dialogs/GDialogEmployeeSelector.vue'
import GDialogOutsourcerSelector from '~/components/molecules/dialogs/GDialogOutsourcerSelector.vue'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
import GEditModeMixin from '~/mixins/GEditModeMixin'
import { PlacedEmployee, PlacedOutsourcer } from '~/models/Placement'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GPlacementDraggableCell,
    GDialogEmployeeSelector,
    GDialogOutsourcerSelector,
    GPlacementSiteOperationScheduleEditDialog,
    GPlacementEmployeePlacementEditDialog,
    GPlacementOutsourcerPlacementEditDialog,
    GPlacementSiteOperationSchedulesDialog,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GEditModeMixin],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * The starting date for generating columns, formatted as a string.
     * - Defaults to today's date in 'YYYY-MM-DD' format, using dayjs.
     * - Used as the base date in 'YYYY-MM-DD' format for the column generation process.
     */
    currentDate: { type: String, required: true },
    /**
     * The number of days to generate columns for, starting from currentDate.
     * - Defines the length of the date range for column generation.
     */
    length: { type: Number, default: 7 },
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
      columns: [],
      dialog: {
        employeeSelector: false,
        employeePlacement: false,
        outsourcerPlacement: false,
        outsourcerSelector: false,
        schedule: false,
        siteDetail: false,
      },
      draggingItem: null,
      editModel: {
        employeePlacement: new PlacedEmployee(),
        employeePlacementPath: '',
        outsourcerPlacement: new PlacedOutsourcer(),
        outsourcerPlacementPath: '',
        schedule: new SiteOperationSchedule(),
      },
      item: {
        siteDetail: null,
      },
      // ユーザーがアクションを行ったセルを特定するためのオブジェクト
      activeCell: null,

      copiedContent: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * data.activeCell に設定された値をもとに、GPlacementDraggableCell への参照を返します。
     */
    activeCellRef() {
      if (!this.activeCell) return null
      const { date, siteId, workShift } = this.activeCell
      const cell = this.$refs?.[`cell-${date}-${siteId}-${workShift}`] || null
      return cell
    },

    /**
     * 従業員を配置するための GPlacementDraggableCell の addBulkEmployees メソッドを返します。
     * - 該当メソッドは computed.activeCellRef 参照から取得します。
     * @param {Array<Object>} employees 配置対象の従業員オブジェクト
     * @param {Object} employee 従業員オブジェクト
     * @param {string} employee.docId 従業員ID
     */
    addEmployeesInBulk() {
      return async (employees) => {
        if (!this.activeCellRef) {
          const message = `activeCell の参照を取得できませんでした。`
          // eslint-disable-next-line no-console
          console.error(message, { activeCell: this.activeCell })
          alert(message)
          return
        }
        await this.activeCellRef.addBulkEmployees(
          employees.map(({ docId }) => docId)
        )
      }
    },

    /**
     * 外注先を配置するための GPlacementDraggableCell の addBulkOutsourcers メソッドを返します。
     * - 該当メソッドは computed.activeCellRef 参照から取得します。
     * - outsourcers は配列ですが、先頭の1件のみが使用されます。
     * - addBulkOutsourcers メソッドは第2引数で追加の繰り返し回数を指定可能です。
     *   -> 現在は 1 で固定しています。
     * @param {Array<Object>} outsourcers 配置対象の外注先オブジェクト
     * @param {Object} outsourcer 外注先オブジェクト
     * @param {string} outsourcer.docId 外注先ID
     */
    addOutsourcersInBulk() {
      return async (outsourcers) => {
        if (!this.activeCellRef) {
          const message = `activeCell の参照を取得できませんでした。`
          // eslint-disable-next-line no-console
          console.error(message, { activeCell: this.activeCell })
          alert(message)
          return
        }
        await this.activeCellRef.addBulkOutsourcers(outsourcers[0].docId, 1)
      }
    },

    /**
     * Generates an array of dates based on the current date and specified length.
     * - Creates an array of dates from currentDate, each formatted as 'YYYY-MM-DD'.
     */
    dates() {
      if (!this.currentDate) return []
      return [...Array(this.length)].map((_, i) =>
        this.$dayjs(this.currentDate).add(i, 'day').format('YYYY-MM-DD')
      )
    },

    selectableEmployees() {
      // activeCellが存在しない場合は空の配列を返す
      if (!this.activeCell) return []

      // 現在のactiveCellの日付に関連する従業員の割り当てを取得
      const assignments =
        this.$store.state.assignments.sites?.[this.activeCell.date]?.[
          this.activeCell.siteId
        ]?.[this.activeCell.workShift] || {}

      // activeCell に配置されている従業員のIDを収集
      const placementedIds = Object.entries(assignments).map(([key]) => key)

      // 全従業員を Vuex から取得
      const allEmployees = this.$store.getters['employees/items']

      // 配置されていない従業員をフィルタリングして返す
      return allEmployees.filter(
        (employee) => !placementedIds.includes(employee.docId)
      )
    },

    selectableOutsourcers() {
      return this.$store.getters['outsourcers/items']
    },

    siteOrder() {
      return this.$store.state['site-order'].data
    },
  },

  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    this.$watch(
      () => [this.$props.currentDate, this.$props.length],
      (newVal, oldVal) => {
        const after = {
          currentDate: newVal?.[0] || undefined,
          length: newVal?.[1] || undefined,
        }
        const before = {
          currentDate: oldVal?.[0] || undefined,
          length: oldVal?.[1] || undefined,
        }
        if (JSON.stringify(after) === JSON.stringify(before)) return
        this.updateColumns()
      },
      { immediate: true }
    )
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async updateColumns() {
      const today = this.$dayjs().format('YYYY-MM-DD')
      const columns = await Promise.all(
        this.dates.map(async (date, index) => {
          const isHoliday =
            this.$dayjs(date).day() && (await this.$holiday.isHoliday(date))
          const dayOfWeek = this.$dayjs(date).format('ddd').toLowerCase()
          return {
            date,
            index,
            col: this.$dayjs(date).locale(ja).format('MM/DD(ddd)'),
            isHoliday, // 祝日情報を追加
            isToday: date === today,
            dayOfWeek: isHoliday ? 'holi' : dayOfWeek,
          }
        })
      )
      this.columns = columns
    },

    /**
     * Excludes a specified site and work shift from the siteOrder.
     * - Finds the index of the given siteWorkShiftId in siteOrder.
     * - If found, removes it from the array and emits an update event to the parent component.
     */
    onClickExcludeSite(id) {
      const index = this.siteOrder.findIndex((order) => order.id === id)
      if (index !== -1) {
        const updatedSiteIndex = [...this.siteOrder]
        updatedSiteIndex.splice(index, 1)
        this.$store.dispatch('site-order/update', updatedSiteIndex)
      }
    },
    /**
     * Displays detailed information for a specified site item.
     * - Clones the item data to avoid direct mutations and assigns it to item.siteDetail.
     * - Opens the site detail dialog by setting dialog.siteDetail to true.
     */
    onClickShowSiteDetail(siteId) {
      this.item.siteDetail = this.$store.getters['site-order/site'](siteId)
      this.dialog.siteDetail = true
    },

    /**
     * 現場の稼働予定を編集するためのダイアログを開きます。
     * - GPlacementDraggableCell コンポーネントの click:schedule イベントを受けて実行されます。
     * - 当該イベントから渡された SiteOperationSchedule インスタンスを引数として受け取ります。
     * @param {SiteOperationSchedule} instance - 編集する SiteOperationSchedule インスタンス
     */
    openScheduleDialog(instance) {
      // インスタンスが存在しない、または正しい型でない場合の処理
      if (!instance || !(instance instanceof SiteOperationSchedule)) {
        const message =
          'SiteOperationScheduleインスタンスが設定されていない、または不正なインスタンスが設定されました。'

        // eslint-disable-next-line no-console
        console.error(message, { instance })
        alert(message)
        return
      }

      // 編集対象のモデルにインスタンスを設定し、ダイアログを開く
      this.editModel.schedule = instance
      this.dialog.schedule = true
    },

    openEmployeePlacementEditDialog({ item, path }) {
      this.editModel.employeePlacement = item
      this.editModel.employeePlacementPath = path
      this.dialog.employeePlacement = true
    },

    openOutsourcerPlacementEditDialog({ item, path }) {
      this.editModel.outsourcerPlacement = item
      this.editModel.outsourcerPlacementPath = path
      this.dialog.outsourcerPlacement = true
    },

    /**
     * slots.site-row のスロットプロパティを生成して返します。
     * @param {Object} order siteOrder オブジェクト
     * @param {string} order.siteId 現場ID
     * @param {string} order.workShift 勤務区分
     */
    getSiteRowSlotProps(order) {
      const attrs = {
        siteId: order.siteId,
        workShift: order.workShift,
        ellipsis: this.ellipsis,
      }
      const on = {
        'click:remove': () => this.onClickExcludeSite(order.id),
        'click:show-detail': () => this.onClickShowSiteDetail(order.siteId),
      }
      return { attrs, on }
    },

    /**
     * GPlacementDraggableCell コンポーネントに引き渡す各種プロパティを生成して返します。
     * @param {Object} column 列生成用オブジェクト
     * @param {string} column.date 日付（YYYY-MM-DD形式）
     * @param {Object} order siteOrder オブジェクト
     * @param {string} order.siteId 現場ID
     * @param {string} order.workShift 勤務区分
     */
    getCellProps(column, order) {
      const attrs = {
        ref: `cell-${column.date}-${order.siteId}-${order.workShift}`,
        date: column.date,
        group: { name: column.date },
        siteId: order.siteId,
        workShift: order.workShift,
        ellipsis: this.ellipsis,
        draggingItem: this.draggingItem,
        copiedContent: this.copiedContent,
      }
      const on = {
        'active-cell': ($event) => (this.activeCell = $event),
        'click:addEmployee': () => (this.dialog.employeeSelector = true),
        'click:addOutsourcer': () => (this.dialog.outsourcerSelector = true),
        'click:edit-employee': this.openEmployeePlacementEditDialog,
        'click:edit-outsourcer': this.openOutsourcerPlacementEditDialog,
        'click:schedule': this.openScheduleDialog,
        'update:copied-content': ($event) => (this.copiedContent = $event),
        'update:dragging-item': ($event) => (this.draggingItem = $event),
      }
      return { attrs, on }
    },
  },
}
</script>

<template>
  <v-simple-table id="placement-table" fixed-header>
    <thead>
      <tr>
        <th
          v-for="column of columns"
          :key="column.date"
          :class="`th-${column.dayOfWeek}`"
        >
          <v-icon v-if="column.isHoliday" color="red">mdi-flag-variant</v-icon>
          {{ column.col }}
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(order, rowIndex) of siteOrder">
        <tr :key="`site-row-${rowIndex}`">
          <td class="site-row" :colspan="length">
            <slot name="site-row" v-bind="getSiteRowSlotProps(order)" />
          </td>
        </tr>
        <tr :key="`placement-row-${rowIndex}`">
          <td
            v-for="column of columns"
            :key="column.date"
            :class="`col-${column.dayOfWeek}`"
          >
            <g-placement-draggable-cell
              v-bind="getCellProps(column, order)?.attrs || {}"
              v-on="getCellProps(column, order)?.on || {}"
            >
              <template #employees="{ attrs, on }">
                <slot name="employees-col" v-bind="{ attrs, on }" />
              </template>
              <template #outsourcers="{ attrs, on }">
                <slot name="outsourcers-col" v-bind="{ attrs, on }" />
              </template>
            </g-placement-draggable-cell>
          </td>
        </tr>
      </template>
    </tbody>

    <!-- employee selector -->
    <g-dialog-employee-selector
      v-model="dialog.employeeSelector"
      :items="selectableEmployees"
      @click:submit="addEmployeesInBulk"
    />

    <!-- outsourcer selector -->
    <g-dialog-outsourcer-selector
      v-model="dialog.outsourcerSelector"
      :items="selectableOutsourcers"
      @click:submit="addOutsourcersInBulk"
    />

    <!-- detail dialog -->
    <g-placement-site-operation-schedules-dialog
      v-model="dialog.siteDetail"
      max-width="840"
      :site-id="item.siteDetail?.docId || ''"
    />

    <!-- schedule dialog -->
    <g-placement-site-operation-schedule-edit-dialog
      v-model="dialog.schedule"
      :instance="editModel.schedule"
    />

    <!-- employee placement dialog -->
    <g-placement-employee-placement-edit-dialog
      v-model="dialog.employeePlacement"
      :item="editModel.employeePlacement"
      :path="editModel.employeePlacementPath"
    />

    <!-- outsourcer placement dialog -->
    <g-placement-outsourcer-placement-edit-dialog
      v-model="dialog.outsourcerPlacement"
      :item="editModel.outsourcerPlacement"
      :path="editModel.outsourcerPlacementPath"
    />
  </v-simple-table>
</template>

<style></style>
