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
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'

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
    GBtnCancelIcon,
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

    /**
     * 表示モードを切り替えます。
     * placement: 配置モードです。移動のためのアイコンと編集のためのボタンが表示されます。
     * confirmation: 確認モードです。配置確認、上番・下番などの切り替えボタンが表示されます。
     */
    mode: {
      type: String,
      default: 'placement',
      validator: (mode) => ['placement', 'confirmation'].includes(mode),
      required: false,
    },

    /**
     * true が指定されると未上番の札がある行のみを表示します。
     */
    onlyNonArrival: {
      type: Boolean,
      default: false,
      required: false,
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * GPlacementCell によって同期される変数です。
       * activeCell: 現在ユーザーがアクションを起こそうとしているセル情報です。
       * copiedContent: コピーされた配置情報です。
       * draggingItem: 現在ドラッグ中のアイテムオブジェクトです。
       */
      activeCell: null,
      copiedContent: null,
      draggingItem: null,

      /**
       * 配置表の列を制御するための配列です。
       * { date, index, col, isHoliday, isToday, isPreviousDay, dayOfWeek }
       * date: YYYY-MM-DD 形式の日付文字列です。
       * index: インデックスです。
       * col: 配置表テーブルの列名用にフォーマットされた日付文字列です。
       * isHoliday: 祝日の場合 true
       * isToday: 当日の場合 true
       * isPreviousDay: 前日以前の場合 true
       * dayOfWeek: sun-sat の曜日を表す文字列（祝日の場合は holi）
       */
      columns: [],

      /**
       * 列メニューに関する情報です。
       * - items で表示するメニューを定義可能です。
       *
       * NOTE:
       * 勤務指示ボタンはモバイル表示では操作不可にしています。
       * -> クリップボードの制御が不安定なため。
       */
      dayMenu: {
        date: '',
        display: false,
        positionX: 0,
        positionY: 0,
        items: [
          {
            title: '配置表印刷',
            icon: 'mdi-printer',
            click: (date) => this.$GENERATE_PLACEMENT_SHEET(date),
          },
          {
            title: '勤務指示',
            icon: 'mdi-message-bulleted',
            // disabled: this.$vuetify.breakpoint.mobile,
            click: (date) => this.createCommandText(date),
          },
        ],
      },

      /**
       * 従業員の配置情報編集用変数です。
       */
      employeePlacementEditor: {
        editModel: new PlacedEmployee(),
        path: '',
      },

      /**
       * 従業員選択画面で未配置の従業員のみで絞り込みを行うかどうかのフラグです。
       */
      onlyUnplaced: false,

      /**
       * 外注先の配置情報編集用変数です。
       */
      outsourcerPlacementEditor: {
        dialog: false,
        editModel: new PlacedOutsourcer(),
        path: '',
      },

      /**
       * 稼働予定編集用変数です。
       */
      schedule: {
        editModel: new SiteOperationSchedule(),
      },

      /**
       * 現場の詳細情報編集用変数です。
       */
      siteDetail: {
        item: null,
      },

      /**
       * スナックバーの表示制御用変数です。
       */
      snackbar: {
        show: false,
        text: '',
      },

      commandText: {
        dialog: false,
        text: null,
      },

      /**
       * 未上番の札が存在する現場-勤務区分のリストです。
       * { id, siteId, workShift, value: [] }
       * - value は従業員ID（または外注先KEY）の配列です。
       * - GPlacementDraggableCell の non-arrivals イベントで更新されます。
       */
      nonArrivals: [],
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
     * props.currentDate, props.length をもとに当該コンポーネントで管理すべき
     * 配置情報の期間を、YYYY-MM-DD 形式文字列の配列で返します。
     * props.currentDate が設定されていない場合は空の配列を返します。
     */
    dates() {
      if (!this.currentDate) return []
      const from = this.$dayjs(this.currentDate).subtract(1, 'day')
      return [...Array(this.length + 1)].map((_, i) =>
        from.add(i, 'day').format('YYYY-MM-DD')
      )
    },

    /**
     * 選択可能な従業員情報を配列で返します。
     */
    selectableEmployees() {
      // activeCellが存在しない場合は空の配列を返す
      if (!this.activeCell) return []

      // Vuex から現在在職中の従業員情報を取得
      const acitiveEmployees = this.$store.getters['employees/active']

      // activeCell の date 限定で配置されている従業員のIDを取得
      const assignedEmployeeIds = this.$store.getters[
        'assignments/employeeIdsByDate'
      ](this.activeCell.date)

      // 従業員が既に配置されている稼働を表す isPlace プロパティを付与して返す
      const result = acitiveEmployees.map((employee) => {
        const isPlaced = assignedEmployeeIds.includes(employee.docId)
        return { ...employee, isPlaced }
      })
      return result
    },

    /**
     * 選択可能な外注先情報を配列で返します
     */
    selectableOutsourcers() {
      return this.$store.getters['outsourcers/items']
    },

    /**
     * 表示対象の現場-勤務区分の配列を返します
     */
    siteOrder() {
      return this.$store.state['site-order'].data
    },

    /**
     * 現在日付の未上番の札がある現場-勤務区分のリストを返します。
     */
    currentDayNonArrivalSiteWorkShifts() {
      return this.nonArrivals
        .filter(({ date, value }) => {
          return date === this.currentDate && value.length > 0
        })
        .flatMap(({ siteId, workShift }) => {
          return {
            id: `${siteId}-${workShift}`,
            siteId,
            workShift,
          }
        })
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
    /**
     * data.nonArrivals を更新します。
     * - GPlacementDraggableCell の non-arrivals イベントから呼び出されます。
     */
    refreshNonArrivals(event) {
      const index = this.nonArrivals.findIndex(
        ({ date, siteId, workShift }) =>
          date === event.date &&
          siteId === event.siteId &&
          workShift === event.workShift
      )
      if (index === -1) {
        this.nonArrivals.push(event)
      } else {
        this.nonArrivals.splice(index, 1, event)
      }
    },

    /**
     * data.columns を更新します。
     * - `columns` イベントで更新した columns の内容を emit します。
     * NOTE:
     * 祝日判断の為の非同期関数を実行するため、columns の生成に computed は使えません。
     */
    async updateColumns() {
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
            isToday: date === this.currentDate,
            isPreviousDay: date < this.currentDate,
            dayOfWeek: isHoliday ? 'holi' : dayOfWeek,
          }
        })
      )
      this.columns = columns
      this.$emit('columns', columns)
    },

    /**
     * 指定された現場-勤務区分を site-order から除外します。
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
     * 指定された現場の詳細情報画面を開きます。
     * - 対象現場の詳細情報（オブジェクト）は Vuex.site-order から取得します。
     */
    onClickShowSiteDetail(siteId) {
      this.siteDetail.item = this.$store.getters['site-order/site'](siteId)
      this.$refs['site-detail-editor'].open()
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
      this.schedule.editModel = instance
      this.$refs['schedule-editor'].open()
    },

    /**
     * 従業員の配置情報編集画面を開きます。
     */
    openEmployeePlacementEditDialog({ item, path }) {
      this.employeePlacementEditor.editModel = item
      this.employeePlacementEditor.path = path
      this.$refs['employee-placement-editor'].open()
    },

    /**
     * 外注先の配置情報編集画面を開きます。
     */
    openOutsourcerPlacementEditDialog({ item, path }) {
      this.outsourcerPlacementEditor.editModel = item
      this.outsourcerPlacementEditor.path = path
      this.$refs['outsourcer-placement-editor'].open()
    },

    /**
     * 列メニューを表示します。
     */
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

    /**
     * 勤務指示用のテキストを生成してクリップボードにコピーします。
     */
    async createCommandText(date) {
      const getPlacements = async () => {
        const dbRef = ref(database, `Placements/${date}`)
        const snapshot = await get(dbRef)
        return snapshot.val()
      }
      try {
        // `Placements/${date}` のデータを取得 -> データが存在しなければ終了
        const placements = await getPlacements(date)

        if (!placements) return

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
            : '※稼働予定未登録※'

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
              const employeeName = employee
                ? `${employee.abbr}${employee.designation}`
                : 'N/A'

              // 異なる勤務区分での複数配置をチェック
              const isAssignedToDifferentShifts = this.$store.getters[
                'assignments/isEmployeeAssignedToDifferentShifts'
              ](date, employeeId)
              const displayEmployeeName = isAssignedToDifferentShifts
                ? `${employeeName}★`
                : `${employeeName}`

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

        if (this.$vuetify.breakpoint.mobile) {
          this.commandText.text = outputText
          this.commandText.dialog = true
        } else {
          await navigator.clipboard.writeText(outputText)
          this.snackbar.text = 'クリップボードにコピーしました。'
          this.snackbar.show = true
        }

        return outputText
      } catch (error) {
        console.error(`配置レポートの生成に失敗しました: ${error.message}`) // eslint-disable-line no-console
      }
    },

    /**
     * 指定された行（現場-勤務区分）にスクロールします。
     */
    scroll(siteWorkShiftId) {
      const target = this.$refs[siteWorkShiftId]
      const container = this.$el.querySelector('div.v-data-table__wrapper')
      if (target && target.length && container) {
        this.$vuetify.goTo(target[0], { container })
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
          :class="{
            'g-col': true,
            ['g-col-' + column.dayOfWeek]: true,
            'g-col-previous': column.isPreviousDay,
            'g-col-today': column.isToday,
          }"
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
    <!-- <tbody> -->
    <transition-group tag="tbody" name="fade">
      <template v-for="(order, rowIndex) of siteOrder">
        <tr
          v-show="
            !onlyNonArrival ||
            currentDayNonArrivalSiteWorkShifts.some(({ id }) => id === order.id)
          "
          :ref="`${order.siteId}-${order.workShift}`"
          :key="`site-row-${rowIndex}`"
          class="g-row g-row-no-hover"
        >
          <td class="site-row" :colspan="length + 1">
            <slot
              name="site-row"
              v-bind="{
                attrs: {
                  siteId: order.siteId,
                  workShift: order.workShift,
                  ellipsis,
                },
                on: {
                  'click:remove': () => onClickExcludeSite(order.id),
                  'click:show-detail': () =>
                    onClickShowSiteDetail(order.siteId),
                },
              }"
            />
          </td>
        </tr>
        <tr
          v-show="
            !onlyNonArrival ||
            currentDayNonArrivalSiteWorkShifts.some(({ id }) => id === order.id)
          "
          :key="`placement-row-${rowIndex}`"
          class="g-row g-row-no-hover"
        >
          <td
            v-for="column of columns"
            :key="column.date"
            :class="{
              'g-col': true,
              [`g-col-${column.dayOfWeek}`]: true,
              'g-col-previous': column.isPreviousDay,
              'g-col-today': column.isToday,
            }"
          >
            <!--
              ref参照の生成について
              - v-forディレクティブの中でrefをダイレクトに定義すると、参照がすべて配列になってしまう。
              - v-bindディレクティブを通すことで直接参照できるようになる。
            -->
            <g-placement-draggable-cell
              v-bind="{
                ref: `cell-${column.date}-${order.siteId}-${order.workShift}`,
              }"
              :date="column.date"
              :site-id="order.siteId"
              :work-shift="order.workShift"
              :ellipsis="ellipsis"
              :disabled="column.isPreviousDay && order.workShift === 'day'"
              :mode="mode"
              :dragging-item="draggingItem"
              :copied-content="copiedContent"
              @active-cell="($event) => (activeCell = $event)"
              @click:addEmployee="() => $refs['employee-selector'].open()"
              @click:addOutsourcer="() => $refs['outsourcer-selector'].open()"
              @click:edit-employee="openEmployeePlacementEditDialog"
              @click:edit-outsourcer="openOutsourcerPlacementEditDialog"
              @click:schedule="openScheduleDialog"
              @update:copied-content="($event) => (copiedContent = $event)"
              @update:dragging-item="($event) => (draggingItem = $event)"
              @non-arrivals="refreshNonArrivals"
            />
          </td>
        </tr>
      </template>
      <!-- </tbody> -->
    </transition-group>
    <tfoot>
      <tr>
        <th
          v-for="column of columns"
          :key="column.date"
          :class="{
            'g-col': true,
            ['g-col-' + column.dayOfWeek]: true,
            'g-col-previous': column.isPreviousDay,
            'g-col-today': column.isToday,
          }"
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

    <!-- 勤務指示ダイアログ -->
    <v-dialog v-model="commandText.dialog">
      <v-card>
        <v-toolbar color="secondary" dark dense flat>
          <v-toolbar-title>勤務指示</v-toolbar-title>
          <v-spacer />
          <g-btn-cancel-icon @click="commandText.dialog = false" />
        </v-toolbar>
        <v-card-text class="pa-4 pb-2">
          <v-textarea
            :value="commandText.text"
            readonly
            autofocus
            hint="コピーして使用してください。"
            persistent-hint
            outlined
            @focus="($event) => $event.target.select()"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

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

    <!-- snackbar -->
    <v-snackbar v-model="snackbar.show" centered color="info" text>
      {{ snackbar.text }}

      <template #action="{ attrs }">
        <v-btn color="info" v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- employee selector -->
    <g-dialog-employee-selector
      ref="employee-selector"
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
      ref="outsourcer-selector"
      :items="selectableOutsourcers"
      @click:submit="addOutsourcersInBulk"
    />

    <!-- detail dialog -->
    <g-placement-site-operation-schedules-dialog
      ref="site-detail-editor"
      max-width="840"
      :site-id="siteDetail.item?.docId || ''"
    />

    <!-- schedule dialog -->
    <g-placement-site-operation-schedule-edit-dialog
      ref="schedule-editor"
      :instance="schedule.editModel"
    />

    <!-- employee placement dialog -->
    <g-placement-employee-placement-edit-dialog
      ref="employee-placement-editor"
      :item="employeePlacementEditor.editModel"
      :path="employeePlacementEditor.path"
    />

    <!-- outsourcer placement dialog -->
    <g-placement-outsourcer-placement-edit-dialog
      ref="outsourcer-placement-editor"
      :item="outsourcerPlacementEditor.editModel"
      :path="outsourcerPlacementEditor.path"
    />
  </v-simple-table>
</template>

<style>
/* fixed テーブルに */
#placement-table > div > table {
  table-layout: fixed;
}

/* テーブルヘッダーのスタイル */
#placement-table > div > table > thead > tr > th {
  text-align: center;
  min-width: 240px;
  max-width: 240px;
  width: 240px;
}

/* 奇数行のサイト行の背景色 */
#placement-table > div > table > tbody > tr:nth-child(odd) .site-row {
  background-color: beige;
}

/* 奇数行のサイト行の左側を固定する */
#placement-table > div > table > tbody > tr:nth-child(odd) .site-row div {
  display: inline-block;
  position: sticky;
  left: 16px;
  z-index: 1 !important; /* 他の要素より前面に表示 */
  /* box-shadow: 1px 0 5px rgba(0, 0, 0, 0.1); */ /* 必要に応じて影を追加 */
}

/* テーブルフッターのスタイル */
#placement-table tfoot {
  position: sticky;
  bottom: 0;
  z-index: 1;
}

#placement-table tfoot th {
  background: #fff;
  text-align: center;
}
</style>
