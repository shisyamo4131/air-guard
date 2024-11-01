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
  components: {
    GPlacementDraggableCell,
    GDialogEmployeeSelector,
  },

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
     * Assignment data object.
     * - Contains data related to employee and site assignments.
     * - Defaults to null if no assignments are provided.
     */
    assignments: { type: Object, default: null },
    /**
     * Array of site contract information.
     * - No filtering by site or work shift is required; relevant data is extracted within the component as needed.
     * - If applicable contract information exists, it sets start and end times when assigning employees.
     */
    siteContracts: { type: Array, default: () => [] },
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
      dialog: {
        employeeSelector: false,
        siteDetail: false,
      },
      item: {
        siteDetail: null,
      },
      // ユーザーがアクションを行ったセルのインスタンス
      activeCell: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * Generates an array of columns based on the current date and specified length.
     * - If currentDate is not set, returns an empty array.
     * - Creates an array of dates from currentDate, each formatted as 'YYYY-MM-DD'.
     * - Maps each date to an object containing:
     *   - date: the formatted date string,
     *   - index: the column index,
     *   - col: a localized string in 'MM/DD(ddd)' format.
     */
    columns() {
      if (!this.currentDate) return []
      const dates = [...Array(this.length)].map((_, i) =>
        dayjs(this.currentDate).add(i, 'day').format('YYYY-MM-DD')
      )
      return dates.map((date, index) => {
        return {
          date,
          index,
          col: dayjs(date).locale(ja).format('MM/DD(ddd)'),
        }
      })
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
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
    onClickShowSiteDetail(item) {
      this.item.siteDetail = structuredClone(item)
      this.dialog.siteDetail = true
    },

    openEmployeeSelector() {
      this.dialog.employeeSelector = true
    },

    /**
     * 複数の従業員を一括で配置します。
     * - data.activeCell で指定されたインデックスに生成されている
     *   GPlacementCell コンポーネントの addBulk() を実行します。
     * - data.activeCell の参照が正しくない場合、エラーになります。
     */
    async addEmployeesInBulk(employees) {
      if (
        isNaN(this.activeCell) ||
        this.$refs.cell.length - 1 < this.activeCell
      ) {
        const message = `activeCell の参照が正しくありません。`
        // eslint-disable-next-line no-console
        console.error(message, { activeCell: this.activeCell })
        alert(message)
        return
      }
      await this.$refs.cell[this.activeCell].addBulk(
        employees.map(({ docId }) => docId)
      )
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
                  'click:show-detail': (item) => onClickShowSiteDetail(item),
                },
              }"
            />
          </td>
        </tr>
        <tr :key="`placement-row-${rowIndex}`">
          <td v-for="(column, colIndex) of columns" :key="column.date">
            <g-placement-draggable-cell
              ref="cell"
              :cell-index="rowIndex * length + colIndex"
              :assignments="assignments?.[column.date] || {}"
              :date="column.date"
              :site-id="order.siteId"
              :work-shift="order.workShift"
              :site-contracts="siteContracts"
              :ellipsis="ellipsis"
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
      :items="$store.getters['employees/items']"
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
