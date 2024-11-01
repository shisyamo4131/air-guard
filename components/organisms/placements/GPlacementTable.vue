<script>
/**
 * GPlacementTable
 *
 * 配置管理用のテーブルコンポーネントです。
 *
 * @author shisyamo4131
 */
import dayjs from 'dayjs'
import ja from 'dayjs/locale/ja'
import GPlacementDraggableCell from './GPlacementDraggableCell.vue'
import GDialogEmployeeSelector from '~/components/molecules/dialogs/GDialogEmployeeSelector.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GPlacementDraggableCell, GDialogEmployeeSelector },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * The starting date for generating columns, formatted as a string.
     * - Defaults to today's date in 'YYYY-MM-DD' format, using dayjs.
     * - Used as the base date in 'YYYY-MM-DD' format for the column generation process.
     */
    currentDate: {
      type: String,
      default: () => dayjs().format('YYYY-MM-DD'),
    },
    /**
     * The number of days to generate columns for, starting from currentDate.
     * - Defines the length of the date range for column generation.
     */
    length: { type: Number, default: 7 },
    /**
     * Enables abbreviated display if set to true.
     */
    ellipsis: { type: Boolean, default: false },
    /**
     * Array representing the order of sites.
     * - Defines the sequence in which sites are arranged or processed.
     * - Defaults to an empty array if no site order is provided.
     */
    siteOrder: { type: Array, default: () => [] },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      columns: [],
      dialog: {
        employeeSelector: false,
        siteDetail: false,
      },
      draggingItem: null,
      item: {
        siteDetail: {
          site: null,
          customer: null,
        },
      },
      // ユーザーがアクションを行ったセルを特定するためのオブジェクト
      activeCell: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * Generates an array of dates based on the current date and specified length.
     * - Creates an array of dates from currentDate, each formatted as 'YYYY-MM-DD'.
     */
    dates() {
      if (!this.currentDate) return []
      return [...Array(this.length)].map((_, i) =>
        dayjs(this.currentDate).add(i, 'day').format('YYYY-MM-DD')
      )
    },

    selectableEmployees() {
      // activeCellが存在しない場合は空の配列を返す
      if (!this.activeCell) return []

      // 現在のactiveCellの日付に関連する従業員の割り当てを取得
      const assignments =
        this.$store.state.assignments.employees?.[this.activeCell.date] || {}

      // 配置されている従業員のIDを収集
      const placementedIds = Object.keys(
        Object.entries(assignments).reduce((acc, [_, employees]) => {
          Object.keys(employees).forEach((employeeId) => {
            acc[employeeId] = true
          })
          return acc
        }, {})
      )

      // 全従業員を Vuex から取得
      const allEmployees = this.$store.getters['employees/items']

      // 配置されていない従業員をフィルタリングして返す
      return allEmployees.filter(
        (employee) => !placementedIds.includes(employee.docId)
      )
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    currentDate: {
      handler() {
        this.updateColumns()
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async updateColumns() {
      const columns = await Promise.all(
        this.dates.map(async (date, index) => {
          const isHoliday =
            this.$dayjs(date).day() && (await this.$holiday.isHoliday(date))
          return {
            date,
            index,
            col: dayjs(date).locale(ja).format('MM/DD(ddd)'),
            isHoliday, // 祝日情報を追加
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
        this.$emit('update:site-order', updatedSiteIndex)
      }
    },
    /**
     * Displays detailed information for a specified site item.
     * - Clones the item data to avoid direct mutations and assigns it to item.siteDetail.
     * - Opens the site detail dialog by setting dialog.siteDetail to true.
     */
    onClickShowSiteDetail(siteId) {
      this.item.siteDetail.site = this.$store.getters['site-order/site'](siteId)
      this.dialog.siteDetail = true
    },

    openEmployeeSelector() {
      this.dialog.employeeSelector = true
    },

    /**
     * 複数の従業員を一括で配置します。
     * - 一括配置を行うためのメソッドは GPlacementDraggableCell が保有しています。
     * - data.activeCell が ref 参照のための情報を保持しています。
     */
    async addEmployeesInBulk(employees) {
      if (!this.activeCell) {
        const message = `activeCell の参照が正しくありません。`
        // eslint-disable-next-line no-console
        console.error(message, { activeCell: this.activeCell })
        alert(message)
        return
      }
      const { date, siteId, workShift } = this.activeCell
      const cell = this.$refs?.[`cell-${date}-${siteId}-${workShift}`] || null
      if (!cell || !cell.length) {
        const message = `activeCell の参照を取得できませんでした。`
        // eslint-disable-next-line no-console
        console.error(message, { activeCell: this.activeCell })
        alert(message)
        return
      }
      await cell[0].addBulk(employees.map(({ docId }) => docId))
      this.dialog.employeeSelector = false
    },
  },
}
</script>

<template>
  <v-simple-table id="placement-table" fixed-header>
    <thead>
      <tr>
        <th v-for="column of columns" :key="column.date">
          <v-icon v-if="column.isHoliday" color="red">mdi-flag-variant</v-icon>
          {{ column.col }}
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(order, rowIndex) of siteOrder">
        <tr :key="`site-row-${rowIndex}`">
          <td colspan="7">
            <slot
              name="site-row"
              v-bind="{
                attrs: { siteId: order.siteId, workShift: order.workShift },
                on: {
                  'click:remove': () => onClickExcludeSite(order.id),
                  'click:show-detail': () =>
                    onClickShowSiteDetail(order.siteId),
                },
              }"
            />
          </td>
        </tr>
        <tr :key="`placement-row-${rowIndex}`">
          <td v-for="column of columns" :key="column.date">
            <g-placement-draggable-cell
              :ref="`cell-${column.date}-${order.siteId}-${order.workShift}`"
              :date="column.date"
              :group="{ name: column.date }"
              :site-id="order.siteId"
              :work-shift="order.workShift"
              :ellipsis="ellipsis"
              :dragging-item.sync="draggingItem"
              @active-cell="activeCell = $event"
              @click:addEmployee="openEmployeeSelector"
            >
              <template #default="{ attrs, on }">
                <slot name="col" v-bind="{ attrs, on }" />
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

    <!-- detail dialog -->
    <v-dialog v-model="dialog.siteDetail" max-width="480">
      <v-card>
        <v-toolbar color="primary" dark dense flat>
          <v-toolbar-title class="text-body-1"> 現場情報詳細 </v-toolbar-title>
          <v-spacer />
          <v-icon @click="dialog.siteDetail = false">mdi-close</v-icon>
        </v-toolbar>
        <v-list class="px-0 py-2" :dense="$vuetify.breakpoint.mobile">
          <v-list-item>
            <v-list-item-icon class="mr-2">
              <v-icon small>mdi-dump-truck</v-icon>
            </v-list-item-icon>
            <v-list-item-title style="white-space: normal; overflow: visible">
              {{ item.siteDetail?.site?.name || 'undefined' }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-icon class="mr-2">
              <v-icon small>mdi-map-marker</v-icon>
            </v-list-item-icon>
            <v-list-item-title style="white-space: normal; overflow: visible">
              {{ item.siteDetail?.site?.address || 'undefined' }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-icon class="mr-2">
              <v-icon left small>mdi-card-account-details</v-icon>
            </v-list-item-icon>
            <v-list-item-title> 実装されていません。 </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </v-simple-table>
</template>

<style></style>
