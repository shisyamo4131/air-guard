<script>
/**
 * 配置管理の従業員タグ用 Draggable コンポーネントです。
 *
 * - リアルタイムリスナーがセットされた Placement クラスインスタンスを受け取ります。
 * - 同じ日付内での D&D のみを許可します。
 *
 * NOTE:
 * - 外注先用コンポーネントと作りがほぼ一緒ですが、細かいところで異なるため別コンポーネントにしています。
 * @author shisyamo4131
 */
import draggable from 'vuedraggable'
import GPlacementTag from './GPlacementTag.vue'
import { Placement } from '~/models/Placement'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { draggable, GPlacementTag },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * リアルタイムリスナーがセットされた Placement クラスインスタンス
     * 配置表の1枠に関するデータを操作できるオブジェクトをイメージしてください。
     */
    placement: {
      type: Object,
      validator: (instance) => instance instanceof Placement,
      required: true,
    },

    /**
     * 現在ドラッグ中のアイテムオブジェクトです。
     */
    draggingItem: { type: undefined, default: null },

    /**
     * コンポーネントを省略表示します。
     * -> GPlacementTag に引き渡します。
     */
    ellipsis: { type: Boolean, default: false },

    /**
     * GPlacementTag の表示モードを切り替えます。
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
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * 当該 Draggable コンポーネントが、現在ドラッグ中のアイテムを
     * 受け入れられるかどうかを返します。
     * - 従業員IDの重複がなければ受け入れます。
     * - 日付、現場ID、勤務区分がすべて一致すれば受け入れます。
     *   -> 自身からドラッグされたアイテムを戻せるようにするため。
     * - 上記以外は受け入れません。
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
        this.placement.date === date &&
        this.placement.siteId === siteId &&
        this.placement.workShift === workShift
      )
    },

    /**
     * 当該 Placement クラスインスタンスの従業員配置順序データです。
     */
    employeeOrder() {
      return this.placement?.data?.employeeOrder || []
    },

    /**
     * 当該 Placement クラスインスタンスの従業員配置詳細データです。
     */
    employees() {
      return this.placement?.data?.employees || null
    },

    /**
     * 当該 Placement クラスインスタンスの情報に一致する SiteContract クラスインスタンスを
     * Vuex.site-order から取得して返します。
     * - 存在しない場合は null を返します。
     */
    siteContract() {
      return this.$store.getters['site-order/siteContract']({
        date: this.placement.date,
        siteId: this.placement.siteId,
        workShift: this.placement.workShift,
      })
    },

    /**
     * 当該 Placement クラスインスタンスの情報に一致する SiteOperationSchedule クラスインスタンスを
     * Vuex.site-order から取得して返します。
     * - 新しい従業員が追加される際に使用されます。
     * - 存在しない場合は新しい SiteOperationSchedule クラスインスタンスを生成して返します。
     * - インスタンス生成時、Placement クラスインスタンスの日付、現場ID、勤務区分を初期値として設定します。
     * - computed.siteContract が存在する場合は開始時刻、終了時刻も初期値として設定します。
     */
    siteOperationSchedule() {
      // Vuex から SiteOperationSchedule を取得
      const { date, siteId, workShift } = this.placement
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
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * DraggingItem を作成して返します。
     * @param {Object} 'vue-draggable' の start イベントオブジェクト
     * @return {Object} DraggingItem オブジェクト
     */
    createDraggingItem(event) {
      const index = event.oldIndex
      return {
        employeeId: this.employeeOrder[index],
        date: this.placement.date,
        siteId: this.placement.siteId,
        workShift: this.placement.workShift,
      }
    },

    /**
     * Draggable の change イベントで実行される処理です。
     * - イベントの種類（added, moved, removed）に応じた処理を行います。
     * added: Draggable に新しいオブジェクトが追加された際に発行されます。
     * moved: Draggable 内でオブジェクトの移動があった場合に発行されます。
     * removed: Draggable 内からオブジェクトが削除された際に発行されます。
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
     * Draggable の change イベントで種類が added であった場合の処理です。
     * - Placement インスタンスの employee.add メソッドを実行します。
     */
    async handleAdd({ element, newIndex }) {
      const { startTime, endTime } = this.siteOperationSchedule.docId
        ? this.siteOperationSchedule
        : this.siteContract || {}
      const { breakMinutes } = this.siteContract || {}
      await this.placement.employee.add({
        employeeId: element,
        index: newIndex,
        startTime,
        endTime,
        breakMinutes,
      })
    },

    /**
     * Draggable の change イベントで種類が moved であった場合の処理です。
     * - Placement インスタンスの employee.move メソッドを実行します。
     */
    async handleMove({ newIndex, oldIndex }) {
      await this.placement.employee.move(newIndex, oldIndex)
    },

    /**
     * Draggable の change イベントで種類が removed であった場合の処理です。
     * - Placement インスタンスの employee.remove メソッドを実行します。
     */
    async handleRemove({ element }) {
      await this.placement.employee.remove(element)
    },

    /**
     * 従業員の編集ボタンがクリックされた時の処理です。
     * - 編集対象の配置従業員のデータオブジェクトを受け取ります。
     * - 編集対象の配置従業員データのパスを生成し、配置従業員データオブジェクトとともに
     *   click:edit イベントを emit します。
     */
    onClickEdit(item) {
      const path = this.placement.getEmployeesPath(item.employeeId)
      this.$emit('click:edit', structuredClone({ item, path }))
    },
  },
}
</script>

<template>
  <draggable
    class="d-flex flex-column pa-2"
    style="min-height: 24px; gap: 8px"
    :value="employeeOrder"
    :disabled="!acceptable || disabled"
    :group="{ name: `employees-${placement?.date || ''}` }"
    handle=".handle"
    v-bind="{ animation: 300 }"
    @start="$emit('update:dragging-item', createDraggingItem($event))"
    @end="$emit('update:dragging-item', null)"
    @change="onChange"
  >
    <div v-for="employeeId of employeeOrder" :key="employeeId">
      <g-placement-tag
        :placement="placement"
        :employee-id="employeeId"
        :dragging-item="draggingItem"
        :disabled="disabled"
        :ellipsis="ellipsis"
        :mode="mode"
        @click:edit="onClickEdit"
      />
    </div>
  </draggable>
</template>

<style></style>
