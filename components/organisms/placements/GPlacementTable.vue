<script>
/**
 * GPlacementTable
 *
 * 配置管理用のテーブルコンポーネントです。
 *
 * @author shisyamo4131
 */
import ja from 'dayjs/locale/ja'
import { get, ref } from 'firebase/database'
import { database } from 'air-firebase'
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
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'

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
    GSwitch,
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
      command: {
        text: '',
      },
      dayMenu: {
        date: '',
        display: false,
        positionX: 0,
        positionY: 0,
        items: [
          {
            title: '配置表印刷',
            icon: 'mdi-printer',
            // disabled: !this.$store.getters['auth/roles'].includes('developer'),
            click: (date) => this.$GENERATE_PLACEMENT_SHEET(date),
          },
          {
            title: '勤務指示',
            icon: 'mdi-message-bulleted',
            disabled: this.$vuetify.breakpoint.mobile,
            click: (date) => this.createCommandText(date),
          },
        ],
      },
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

      snackbar: {
        show: false,
        text: '',
      },

      onlyUnplaced: false,
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

      // activeCell の date 限定で配置されている従業員のIDを取得
      const assignedEmployeeIds = this.$store.getters[
        'assignments/employeeIdsByDate'
      ](this.activeCell.date)

      const result = this.$store.getters['employees/active'].map((employee) => {
        return {
          ...employee,
          isPlaced: assignedEmployeeIds.includes(employee.docId),
        }
      })
      return result
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

    showDayMenu(e, date) {
      e.preventDefault()
      this.dayMenu.display = false
      this.dayMenu.positionX = e.clientX
      this.dayMenu.positionY = e.clientY
      this.dayMenu.date = date
      this.$nextTick(() => {
        this.dayMenu.display = true
      })
    },

    async getPlacements(date) {
      const dbRef = ref(database, `Placements/${date}`)
      const snapshot = await get(dbRef)
      return snapshot.val()
    },

    async createCommandText(date) {
      try {
        // `Placements/${date}` のデータを取得
        const placements = await this.getPlacements(date)
        let outputText = ''

        // 日付のフォーマット（先頭に追加）
        const formattedDate = this.$dayjs(date)
          .locale('ja')
          .format('MM/DD (ddd)')
        outputText += `${formattedDate} 配置\n\n`

        // siteOrderをループして出力順を制御
        for (const { siteId, workShift } of this.siteOrder) {
          const siteData = placements[siteId]
          if (!siteData) continue // siteDataがない場合はスキップ

          const shiftData = siteData[workShift]
          if (!shiftData) continue // 指定のworkShiftがない場合はスキップ

          // 現場オブジェクトの取得
          const site = this.$store.getters['sites/get'](siteId)
          const siteName = site ? site.name : 'N/A' // site.nameが存在しない場合はN/Aと表示
          const siteAddress = site ? site.address : 'N/A' // site.addressが存在しない場合はN/Aと表示

          // 取引先オブジェクトの取得
          const customerId = site ? site.customerId : null
          const customer = customerId
            ? this.$store.getters['customers/get'](customerId)
            : null
          const customerAbbr = customer ? customer.abbr : 'N/A'

          // 勤務区分のシンボルを設定
          const workShiftSymbol = workShift === 'day' ? '○' : '●'

          // 稼働予定オブジェクトの取得
          const operationSchedule = this.$store.getters[
            'site-order/siteOperationSchedule'
          ]({ date, siteId, workShift })
          const scheduleText = operationSchedule
            ? `${operationSchedule.startTime} ～ ${operationSchedule.endTime}`
            : 'N/A'

          // 検定配置路線の表示を追加
          const qualificationText =
            operationSchedule && operationSchedule.qualification
              ? '《検定配置路線》'
              : ''

          // 取引先名、現場名、住所、稼働時間を出力
          outputText += `${customerAbbr}\n`
          outputText += `${siteName} ${qualificationText}\n` // 現場名の後に資格判定を追加
          outputText += `${siteAddress}\n`
          outputText += `${scheduleText}\n`

          // 配置された従業員を指定された順序でループ
          if (shiftData.employeeOrder) {
            for (const employeeId of shiftData.employeeOrder) {
              const employee = this.$store.getters['employees/get'](employeeId)
              const employeeName = employee ? employee.abbr : 'N/A'

              // 異なる勤務区分での複数配置をチェック
              const isAssignedToDifferentShifts = this.$store.getters[
                'assignments/isEmployeeAssignedToDifferentShifts'
              ](date, employeeId)
              const displayEmployeeName = isAssignedToDifferentShifts
                ? `${employeeName}警備士★`
                : `${employeeName}警備士`

              outputText += `${workShiftSymbol} ${displayEmployeeName}\n`
            }
          }

          // 配置された外注先を指定された順序でループ
          if (shiftData.outsourcerOrder) {
            for (const outsourcerKey of shiftData.outsourcerOrder) {
              const [outsourcerId] = outsourcerKey.split('-') // outsourcerKeyからoutsourcerIdを抽出
              const outsourcer =
                this.$store.getters['outsourcers/get'](outsourcerId)
              const outsourcerName = outsourcer ? outsourcer.name : 'N/A'
              outputText += `${workShiftSymbol} ${outsourcerName}\n`
            }
          }

          // 区切りの改行
          outputText += '\n'
        }

        // 生成されたテキストをクリップボードにコピー
        await navigator.clipboard.writeText(outputText)

        this.snackbar.text = 'クリップボードにコピーしました。'
        this.snackbar.show = true
        return outputText
      } catch (error) {
        console.error(`配置レポートの生成に失敗しました: ${error.message}`) // eslint-disable-line no-console
      }
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
          <v-btn
            icon
            small
            :disabled="dayMenu.display"
            @click="($event) => showDayMenu($event, column.date)"
          >
            <v-icon small>mdi-menu</v-icon>
          </v-btn>
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

    <tfoot>
      <tr>
        <th
          v-for="column of columns"
          :key="column.date"
          :class="`th-${column.dayOfWeek}`"
        >
          <v-icon v-if="column.isHoliday" color="red">mdi-flag-variant</v-icon>
          <span class="grey--text text--darken-2 text-subtitle-2">
            {{
              `稼働数: ${
                $store.getters['assignments/operationCount'](column.date).total
              }`
            }}
          </span>
        </th>
      </tr>
    </tfoot>

    <!-- dayMenu -->
    <v-menu
      v-model="dayMenu.display"
      :position-x="dayMenu.positionX"
      :position-y="dayMenu.positionY"
      absolute
      offset-y
    >
      <v-list dense>
        <v-list-item
          v-for="(menu, index) of dayMenu.items"
          :key="index"
          :disabled="menu?.disabled || false"
          @click="menu.click(dayMenu.date)"
        >
          <v-list-item-title>
            <v-icon left small>
              {{ menu.icon }}
            </v-icon>
            {{ menu.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-snackbar v-model="snackbar.show" centered color="primary" text>
      {{ snackbar.text }}

      <template #action="{ attrs }">
        <v-btn color="primary" v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- employee selector -->
    <g-dialog-employee-selector
      v-model="dialog.employeeSelector"
      :items="selectableEmployees"
      :custom-filter="(item) => !onlyUnplaced || item.isPlaced === false"
      @click:submit="addEmployeesInBulk"
    >
      <template #filter>
        <div class="text-subtitle-2 grey--text text--darken-2">
          {{
            `未配置: ${
              selectableEmployees.filter(({ isPlaced }) => !isPlaced).length
            } / ${selectableEmployees.length}`
          }}
        </div>
        <v-spacer />
        <g-switch
          v-model="onlyUnplaced"
          class="mt-0 pt-0"
          label="未配置のみ表示"
          hide-details
        />
      </template>
      <template #third-line="props">
        <v-list-item-subtitle
          v-if="props.item.isPlaced"
          class="red--text text-caption"
        >
          <v-icon color="error" left small>mdi-alert</v-icon
          >既に配置されています。
        </v-list-item-subtitle>
        <v-list-item-subtitle v-else class="text-caption">
          未配置
        </v-list-item-subtitle>
      </template>
    </g-dialog-employee-selector>

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
