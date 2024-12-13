<script>
/**
 * Vuetifyのv-data-tableを拡張した、カスタムアクション（編集、削除、詳細）を提供する DataTable コンポーネントです。
 * 各アクションには、対応するアイコンコンポーネントが使用されます。
 *
 * 主な機能:
 * - アクション列の追加（編集、削除、詳細）
 * - 固定ヘッダーとカスタム高さのサポート
 * - ページ変更時にトップへスクロール
 * - デフォルトフッターを非表示（paginationは別のコンポーネントで実装）
 * - filterProps プロパティを使用することで headers に定義していないプロパティについてもフィルタリングが可能です。
 *
 * props設定（VDataTable の props 以外）:
 * - actions: 使用するアクションのリスト（'edit', 'delete', 'detail'）
 * - disableEdit: 編集アクションの無効化
 * - disableDelete: 削除アクションの無効化
 * - disableDetail: 詳細アクションの無効化
 * - filterProps: headers に定義されたプロパティ以外にフィルタリングに含めるプロパティを配列で定義します。
 *                customFilter を設定した場合は無視されます。
 *
 * @author shisyamo4131
 */

import GIconDelete from '~/components/atoms/icons/GIconDelete.vue'
import GIconEdit from '~/components/atoms/icons/GIconEdit.vue'
import GIconDetail from '~/components/atoms/icons/GIconDetail.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GIconDelete, GIconEdit, GIconDetail },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    actions: { type: Array, default: () => [], required: false },
    checkboxColor: { type: String, default: 'primary', required: false },
    customFilter: { type: Function, default: undefined, required: false },
    disableEdit: { type: Boolean, default: false, required: false },
    disableDelete: { type: Boolean, default: false, required: false },
    disableDetail: { type: Boolean, default: false, required: false },
    filterProps: { type: Array, default: () => [], required: false },
    headers: { type: Array, default: () => [], required: false },
    height: { type: [Number, String], default: undefined, required: false },
    hideDefaultFooter: { type: Boolean, default: true, required: false },
    itemKey: { type: String, default: 'docId', required: false },
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
     * VDataTable に適用させるカスタムフィルターです。
     * - VDataTable は既定では headers に定義した項目のみをフィルターの対象とします。
     * - props.filterProps で指定されたプロパティについてもフィルタリングを実行します。
     * - filterProps が空配列の場合、デフォルトのフィルター処理のみ実行されます。
     */
    internalCustomFilter(val, search, item) {
      // props.customFilter が設定されていればそれをそのまま返す
      if (this.customFilter) return this.customFilter

      // 検索文字列が無効（空、null、undefined）の場合はすべての項目を表示
      if (!search) return true

      // 検索文字列を小文字に変換して事前に保持（パフォーマンス向上）
      const searchLower = search.toLowerCase()

      // VDataTable のデフォルトフィルター処理
      const defaultFilterResult =
        val != null &&
        typeof val !== 'boolean' &&
        val.toString().toLowerCase().includes(searchLower)

      // filterProps が空の場合、デフォルトフィルターのみで判定
      if (this.filterProps.length === 0) {
        return defaultFilterResult
      }

      // props.filterProps に指定されたプロパティをフィルター処理
      const propsFilterResult = this.filterProps.some((prop) => {
        const propValue = item?.[prop] ?? null // プロパティ値を取得（安全なアクセス）
        return (
          propValue != null &&
          propValue.toString().toLowerCase().includes(searchLower)
        )
      })

      // デフォルトフィルター結果または追加プロパティのフィルター結果を返す
      return defaultFilterResult || propsFilterResult
    },

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
    :checkbox-color="checkboxColor"
    :custom-filter="internalCustomFilter"
    fixed-header
    :headers="internalHeaders"
    :height="internalHeight"
    :hide-default-footer="hideDefaultFooter"
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
      <slot
        name="item.actions"
        v-bind="{ ...props, disableEdit, disableDelete, disableDetail }"
      >
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
      <slot
        v-for="action of actions.filter(
          (action) =>
            action !== 'edit' && action !== 'delete' && action !== 'detail'
        )"
        :name="action"
        v-bind="props"
      />
    </template>
  </v-data-table>
</template>

<style></style>
