<script>
import GIconDelete from '~/components/atoms/icons/GIconDelete.vue'
import GIconEdit from '~/components/atoms/icons/GIconEdit.vue'
import GIconDetail from '~/components/atoms/icons/GIconDetail.vue'

/**
 * ## GDataTable
 * @version 1.0.0
 * @date 2024-06-21
 * @autor shisyamo4131
 *
 * 概要:
 * GDataTableコンポーネントは、Vuetifyのv-data-tableを拡張し、カスタムアクション（編集、削除、詳細）を提供します。
 * 各アクションには、対応するアイコンコンポーネントが使用されます。
 *
 * 主な機能:
 * - アクション列の追加（編集、削除、詳細）
 * - 固定ヘッダーとカスタム高さのサポート
 * - ページ変更時にトップへスクロール
 * - デフォルトフッターを非表示（paginationは別のコンポーネントで実装）
 *
 * 使用例:
 * <GDataTable :headers="headers" :items="items" :actions="['edit', 'delete', 'detail']" @click:edit="onEdit" @click:delete="onDelete" @click:detail="onDetail" />
 *
 * props設定:
 * - actions: 使用するアクションのリスト（'edit', 'delete', 'detail'）
 * - disableEdit: 編集アクションの無効化
 * - disableDelete: 削除アクションの無効化
 * - disableDetail: 詳細アクションの無効化
 * - headers: テーブルのヘッダー設定
 * - height: テーブルの高さ
 * - itemKey: 各アイテムの一意のキー
 *
 * 更新履歴:
 * 2024-06-21 - 初版作成
 */

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GIconDelete,
    GIconEdit,
    GIconDetail,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    actions: {
      type: Array,
      default: () => [],
      required: false,
    },
    disableEdit: {
      type: Boolean,
      default: false,
      required: false,
    },
    disableDelete: {
      type: Boolean,
      default: false,
      required: false,
    },
    disableDetail: {
      type: Boolean,
      default: false,
      required: false,
    },
    headers: {
      type: Array,
      default: () => [],
      required: false,
    },
    height: {
      type: [Number, String],
      default: undefined,
      required: false,
    },
    itemKey: {
      type: String,
      default: 'docId',
      required: false,
    },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * テーブルのヘッダーにアクション列を追加
     */
    internalHeaders() {
      const actionColumn = {
        text: '',
        value: 'actions',
        sortable: false,
        align: 'right',
      }
      const result = [...this.headers]
      if (this.actions.length) result.push(actionColumn)
      return result
    },
    /**
     * テーブルの高さを計算
     */
    internalHeight() {
      if (!this.height) return undefined
      const result = parseInt(this.height)
      return result <= 0 ? undefined : result
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * ページが変更されたときにトップにスクロール
     */
    '$attrs.page'(newVal, oldVal) {
      if (newVal === oldVal) return
      this.scrollToTop()
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * テーブルのトップにスクロールする
     */
    scrollToTop() {
      const wrapper = this.$el.querySelector('div.v-data-table__wrapper')
      this.$vuetify.goTo(this, { container: wrapper })
    },
  },
}
</script>

<template>
  <v-data-table
    v-bind="$attrs"
    fixed-header
    :headers="internalHeaders"
    :height="internalHeight"
    hide-default-footer
    :item-key="itemKey"
    v-on="$listeners"
  >
    <!-- ### SLOTS ### -->
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
    <!-- ### ACTIONS COLUMN ### -->
    <template #[`item.actions`]="props">
      <slot name="item.actions" v-bind="props">
        <v-btn
          v-if="actions.includes('edit')"
          icon
          :disabled="disableEdit"
          @click="$emit('click:edit', props.item)"
        >
          <g-icon-edit />
        </v-btn>
        <v-btn
          v-if="actions.includes('delete')"
          icon
          :disabled="disableDelete"
          @click="$emit('click:delete', props.item)"
        >
          <g-icon-delete />
        </v-btn>
        <v-btn
          v-if="actions.includes('detail')"
          icon
          :disabled="disableDetail"
          @click="$emit('click:detail', props.item)"
        >
          <g-icon-detail />
        </v-btn>
      </slot>
    </template>
  </v-data-table>
</template>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
