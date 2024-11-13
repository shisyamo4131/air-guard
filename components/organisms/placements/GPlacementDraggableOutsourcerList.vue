<script>
/**
 * ## GPlacementDraggableOutsourcerList
 *
 * 外注先の配置情報を編集、管理するためのコンポーネントです。
 * ルートコンポーネントに vue-draggable を使用しており、外注先情報を表示するためのスロットを提供します。
 *
 * 注意事項:
 * draggable コンポーネントは group オプションで name が固定されます。
 * `outsourcers-${date}-${siteId}-${workShift}`
 * 同一コンポーネント内でのドラッグ操作のみを可能にしています。
 * 外注先の配置情報については、データを一意に識別するための KEY にインデックスを使用しているため、
 * 別現場-勤務区分への D&D を行うことができません。
 *
 * ### props.placement
 * 親コンポーネントで生成された Placement インスタンスです。
 * D&D などによって編集された配置情報を Realtime Database に更新するためのメソッドが提供されます。
 *
 * ### slots.outsourcers
 * outsourcerOrder の分だけ生成される、配置された外注先情報を表示するコンポーネントのスロットです。
 * 様々な属性と、コンポーネントが emit するイベントの処理を定義しています。
 *
 * ### events.click:edit
 * 配置された外注先情報を表示するコンポーネントの click:edit イベントで emit されるイベントです。
 * 当該外注先情報オブジェクトと、当該オブジェクトを更新するための Realtime Database のパスを含むオブジェクトを emit します。
 */
import draggable from 'vuedraggable'
import { Placement } from '~/models/Placement'
export default {
  components: { draggable },

  props: {
    ellipsis: { type: Boolean, default: false },

    /**
     * チップの表示モードを切り替えます。
     * placement: 配置モードです。移動のためのアイコンと編集のためのボタンが表示されます。
     * confirmation: 確認モードです。配置確認、上番・下番などの切り替えボタンが表示されます。
     */
    mode: {
      type: String,
      default: 'placement',
      validator: (mode) => ['placement', 'confirmation'].includes(mode),
      required: false,
    },

    placement: {
      type: Object,
      validator: (instance) => instance instanceof Placement,
      required: true,
    },

    /**
     * true にすると Draggable が無効になります。
     */
    disabled: { type: Boolean, default: false, required: false },
  },

  computed: {
    outsourcerOrder() {
      return this.placement?.data?.outsourcerOrder || []
    },

    outsourcers() {
      return this.placement?.data?.outsourcers || null
    },

    siteContract() {
      return this.$store.getters['site-order/siteContract']({
        date: this.placement.date,
        siteId: this.placement.siteId,
        workShift: this.placement.workShift,
      })
    },
  },

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

    /**
     * 外注先の配置状態がクリックされた時の処理です。
     * Placement インスタンスが提供するメソッドを利用して外注先の配置状態を更新します。
     */
    onClickStatus({ outsourcerKey, status }) {
      try {
        if (status === 'unconfirmed')
          this.placement.outsourcer.confirm(outsourcerKey)
        if (status === 'confirmed')
          this.placement.outsourcer.arrive({ outsourcerKey })
        if (status === 'arrived')
          this.placement.outsourcer.leave({ outsourcerKey })
        if (status === 'leaved')
          this.placement.outsourcer.unconfirm(outsourcerKey)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        alert(err.message)
      }
    },
  },
}
</script>

<template>
  <draggable
    class="d-flex flex-column pa-2 flex-grow-1"
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
      <slot
        name="outsourcers"
        v-bind="{
          attrs: {
            ...(outsourcers?.[outsourcerKey] || {}),
            ...placement,
            outsourcerKey,
            ellipsis,
            mode,
            disabled,
          },
          on: {
            'click:edit': () =>
              onClickEdit(outsourcers?.[outsourcerKey] || null),
            'click:remove': () => handleRemove({ element: outsourcerKey }),
            'click:status': (params) => onClickStatus(params),
          },
        }"
      />
    </div>
  </draggable>
</template>

<style></style>
