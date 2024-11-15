<script>
/**
 * 配置管理の外注先タグ用 Draggable コンポーネントです。
 *
 * - リアルタイムリスナーがセットされた Placement クラスインスタンスを受け取ります。
 * - 同一枠内での順序入れ替え処理のみを許容します。
 *
 * NOTE:
 * - 従業員用コンポーネントと作りがほぼ一緒ですが、細かいところで異なるため別コンポーネントにしています。
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
     * 当該 Placement クラスインスタンスの外注先配置順序データです。
     */
    outsourcerOrder() {
      return this.placement?.data?.outsourcerOrder || []
    },

    /**
     * 当該 Placement クラスインスタンスの外注先配置詳細データです。
     */
    outsourcers() {
      return this.placement?.data?.outsourcers || null
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
     * Draggable の change イベントで実行される処理です。
     * - イベントの種類（added, moved, removed）に応じた処理を行います。
     * added: Draggable に新しいオブジェクトが追加された際に発行されます。
     * moved: Draggable 内でオブジェクトの移動があった場合に発行されます。
     * removed: Draggable 内からオブジェクトが削除された際に発行されます。
     */
    async onChange(event) {
      try {
        const { added, moved, removed } = event
        // if (added) await this.handleAddOutsourcer(added)
        if (added) {
          alert('ドラッグによる別現場への移動はできません。') // KEY にインデックスを使用するため D&D による追加は不可。
        }
        if (moved) await this.handleMove(moved)
        if (removed) await this.handleRemove(removed)
      } catch (err) {
        console.error(err) // eslint-disable-line no-console
        alert(err.message)
      }
    },

    async handleMove({ newIndex, oldIndex }) {
      await this.placement.outsourcer.move(newIndex, oldIndex)
    },

    async handleRemove({ element }) {
      await this.placement.outsourcer.remove(element)
    },

    /**
     * 外注先の編集ボタンがクリックされた時の処理です。
     * - 編集対象の配置外注先データオブジェクトを受け取ります。
     * - 編集対象の配置外注先データのパスを生成し、配置外注先データオブジェクトとともに
     *   click:edit イベントを emit します。
     */
    onClickEdit(item) {
      const path = this.placement.getOutsourcersPath(item.outsourcerKey)
      this.$emit('click:edit', structuredClone({ item, path }))
    },
  },
}
</script>

<template>
  <draggable
    class="d-flex flex-column pa-2"
    style="min-height: 24px; gap: 8px"
    :value="outsourcerOrder"
    :disabled="disabled"
    :group="{
      name: `outsourcers-${placement.date}-${placement.siteId}-${placement.workShift}`,
    }"
    handle=".handle"
    v-bind="{ animation: 300 }"
    @change="onChange"
  >
    <div v-for="outsourcerKey of outsourcerOrder" :key="outsourcerKey">
      <g-placement-tag
        :placement="placement"
        :outsourcer-key="outsourcerKey"
        :disabled="disabled"
        :ellipsis="ellipsis"
        :mode="mode"
        @click:edit="onClickEdit"
      />
    </div>
  </draggable>
</template>

<style></style>
