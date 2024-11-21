<script>
/**
 * 配置表の特定の日付、現場、勤務区分のセルに該当するコンポーネントです。
 *
 * - 親コンポーネント（GPlacementTable）から日付、現場ID、勤務区分を受け取ります。
 * - 受け取った情報から Placement クラスインスタンスを生成します。
 *   -> Placement クラスインスタンスの起点となります。
 *
 * NOTE:
 * - v-for ディレクティブで繰り返し生成されるコンポーネントなので、自身に
 *   Dialog や Menu コンポーネントの内包できません。
 * - Placement クラスインスタンスが提供する機能を利用したデータの更新処理は
 *   当該コンポーネントが親コンポーネントに提供するようにしています。
 *   -> 親コンポーネントが自身を特定するための情報として active-cell イベントを emit します。
 *   -> 親コンポーネントは active-cell イベントで受け取った情報を基に当該コンポーネントを特定し、
 *      当該コンポーネントが提供するメソッドを実行します。
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
     * 日付、現場ID、勤務区分です。
     */
    date: { type: String, required: true },
    siteId: { type: String, required: true },
    workShift: { type: String, required: true },

    /**
     * コピーされた配置情報（順序のみ）で、employeeIds および outsourcers を
     * Key としたオブジェクトです。
     * 自身または他のコンポーネントで生成されたものが親からリレーされます。
     */
    copiedContent: { type: undefined, default: null },

    /**
     * 現在ドラッグ中のアイテムオブジェクトです。
     * 自身または他のコンポーネントで生成されたものが親からリレーされます。
     */
    draggingItem: { type: Object, default: null },

    /**
     * コンポーネントを省略表示します。
     * -> GPlacementEmployeeList, GPlacementOutsourcerList に引き渡します。
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
     * true にすると Draggable が無効になります。
     */
    disabled: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * Placement クラスインスタンス用変数です。
       * 当該コンポーネントおよび他のコンポーネントで Placement クラスインスタンスの
       * 存在の有無により処理を分けることがあるため、初期値および不要に場合は null でなければなりません。
       */
      placement: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * 当該現場-勤務区分に配置されている従業員（または外注先）で未上番であるものの
     * 従業員ID（または外注先KEY）を返します。
     */
    nonArrivals() {
      if (!this.placement?.data) return []

      const employees = Object.entries(this.placement.data.employees || {})
        .filter(([_, data]) => !data.arrivedAt)
        .map(([employeeId]) => ({ id: employeeId, type: 'employee' }))

      const outsourcers = Object.entries(this.placement.data.outsourcers || {})
        .filter(([_, data]) => !data.arrivedAt)
        .map(([outsourcerKey]) => ({ id: outsourcerKey, type: 'outsourcer' }))

      return [...employees, ...outsourcers]
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

    /**
     * 従業員または外注先の配置が存在するかどうかを返します。
     * - 主にスピードダイヤルのボタン制御に使用されます。
     */
    hasSomeOrder() {
      const employees = this.placement?.data?.employeeOrder || []
      const outsourcers = this.placement?.data?.outsourcerOrder || []
      return employees.length + outsourcers.length > 0
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * computed.nonArraivals を監視します。
     * - non-arrivals イベントを emit します。
     */
    nonArrivals: {
      handler(v) {
        this.$emit('non-arrivals', {
          date: this.date,
          siteId: this.siteId,
          workShift: this.workShift,
          value: v,
        })
      },
      immediate: true,
      deep: true,
    },
  },

  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    /**
     * 日付、現場ID、勤務区分をまとめて監視します。
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
     * Placement クラスインスタンスの subscribe を実行し、配置情報への
     * リアルタイムリッスンを開始します。
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
     * Placement クラスインスタンスの unsubscribe を実行し、
     * 配置情報への購読を解除します。
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
      const { date, siteId, workShift } = this
      this.$emit('active-cell', { date, siteId, workShift })
      this.$nextTick(() => this.$emit('click:addEmployee'))
    },

    /**
     * 外注先追加ボタンがクリックされた時の処理です。
     * - active-cell イベントで自身を特定するためのオブジェクトを emit します。
     * - click:addOutsourcer イベント emit します。
     */
    onClickAddOutsourcer() {
      const { date, siteId, workShift } = this
      this.$emit('active-cell', { date, siteId, workShift })
      this.$nextTick(() => this.$emit('click:addOutsourcer'))
    },

    /**
     * 引数で従業員IDの配列を受け取り、従業員を配置します。
     * - 現場の取極めが存在する場合、取極めの開始時刻・終了時刻・休憩時間が適用されます。
     * NOTE:
     * - 当該コンポーネントでは使用されず、親コンポーネントから実行されます。
     * @param {Array<string>} - 従業員IDの配列
     */
    async addBulkEmployees(employeeIds) {
      const func = this.placement.employee.addBulk
      const { startTime, endTime } = this.siteOperationSchedule.docId
        ? this.siteOperationSchedule
        : this.siteContract || {}
      const { breakMinutes } = this.siteContract || {}
      await func({ employeeIds, startTime, endTime, breakMinutes })
    },

    /**
     * 外注先を一括で配置します。
     * - 現場の取極めが存在する場合、取極めの開始時刻・終了時刻・休憩時間が適用されます。
     * NOTE:
     * - 当該コンポーネントでは使用されず、親コンポーネントから実行されます。
     * - 単一の外注先を複数登録するメソッドです。
     */
    async addBulkOutsourcers(outsourcerId, length) {
      const func = this.placement.outsourcer.addBulk
      const { startTime, endTime } = this.siteOperationSchedule.docId
        ? this.siteOperationSchedule
        : this.siteContract || {}
      const { breakMinutes } = this.siteContract || {}
      await func({ outsourcerId, length, startTime, endTime, breakMinutes })
    },

    /**
     * スピードダイヤルのコピーボタンがクリックされた時の処理です。
     * 自身に配置されている従業員および外注先のデータを update:copied-content イベントで emit します。
     */
    contentCopy() {
      const employeeIds = this.placement?.data?.employeeOrder || []
      const outsourcerOrder = this.placement?.data?.outsourcerOrder || []
      const outsourcers =
        outsourcerOrder.length === 0
          ? null
          : outsourcerOrder.reduce((acc, i) => {
              const [outsourcerId] = i.split('-')
              if (!acc[outsourcerId]) acc[outsourcerId] = { length: 0 }
              acc[outsourcerId].length += 1
              return acc
            }, {})
      this.$emit('update:copied-content', { employeeIds, outsourcers })
    },

    /**
     * スピードダイヤルのペーストボタンがクリックされた時の処理です。
     * 自身が受け取った copiedContent オブジェクトを基に、配置情報を更新します。
     */
    async contentPaste() {
      if (!this.copiedContent) return
      if (this.copiedContent.employeeIds) {
        await this.addBulkEmployees(this.copiedContent.employeeIds)
      }
      if (this.copiedContent.outsourcers) {
        const outsourcerIds = Object.keys(this.copiedContent.outsourcers)
        for (const outsourcerId of outsourcerIds) {
          await this.addBulkOutsourcers(
            outsourcerId,
            this.copiedContent.outsourcers[outsourcerId].length
          )
        }
      }
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
      :disabled="disabled"
      small
      @click="$emit('click:schedule', siteOperationSchedule)"
    />

    <!-- アクション スピードダイヤル -->
    <g-placement-action-speed-dial
      v-if="!disabled"
      style="position: absolute; bottom: 2px; right: -12px"
      :disabled-copy="!hasSomeOrder"
      :disabled-paste="hasSomeOrder || !copiedContent || disabled"
      @click:add-employee="onClickAddEmployee"
      @click:add-outsourcer="onClickAddOutsourcer"
      @click:copy="contentCopy"
      @click:paste="contentPaste"
    />

    <!-- メインコンテナ -->
    <div
      style="border: 1px solid lightgray"
      class="d-flex flex-column py-2 flex-grow-1"
    >
      <!-- 従業員用 Draggable コンポーネント -->
      <g-placement-draggable-employee-list
        :dragging-item="draggingItem"
        :ellipsis="ellipsis"
        :mode="mode"
        :disabled="disabled"
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
        :mode="mode"
        :placement="placement"
        :disabled="disabled"
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
