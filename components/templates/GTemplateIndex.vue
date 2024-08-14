<script>
/**
 * ### GTemplateIndex
 *
 * 各種インデックスページ用のテンプレートです。
 *
 * 機能の詳細:
 * - ヘッダーとしてVToolbarを内包しており、既定で検索用TextFieldが配置されています。
 * - 検索用TextFieldの前後に用意されたスロットでカスタマイズ可能です。
 * - defaultスロットにVDataTableを指定することで自動的にレイアウトされます。
 * - フッターとしてVPaginationを内包しており、defaultスロットに指定されたVDataTableと連携します。
 *
 * lazySearch:
 * 検索用TextFieldに入力された値が、`props.delay`で指定されたミリ秒後に同期されます。
 * 値の更新がデバウンスされるため、ユーザーに入力された値でAPI検索などを行う場合に有用です。
 *
 * search:
 * 検索用TextFieldに入力された値は、defaultスロットのattrsプロパティで提供されません。
 * -> v-bind="attrs"でsearchを提供すると独自のフィルターが必要な場合にコードが複雑になる。
 * -> lazySearchの値を使用するケースも想定される。
 * defaultスロットのsearchプロパティを使用するか、親コンポーネント側で制御します。
 *
 * 注意事項:
 * - VDataTableにはdefaultスロットのattrsプロパティでclass: 'flex-table'が設定されます。
 * - flex-tableに関するCSS設定はdefaultレイアウトで定義されます。
 *
 * @props
 * @prop {Number} delay - 検索用TextFieldの入力値でlazySearchが更新されるまでの遅延時間です。
 * @prop {Boolean} extend - VToolBarのextentionスロットを有効にします。
 * @prop {Array} items - VDataTableに引き渡される配列です。
 * @prop {String} lazySearch - 検索用TextFieldの入力値です。.sync修飾子を使用することでデバウンスされて同期されます。
 * @prop {String} saerch - 検索用TextFieldの入力値です。.sync修飾子で同期されます。
 *
 * @events
 * @event update:lazySearch - 検索用TextFieldの入力値をデバウンス後にemitします。
 * @event update:search - 検索用TextFieldの入力値です。
 *
 * @slots
 * @slot append-search - 検索用TextFieldの後ろに配置されます。
 * @slot default - VDataTable用のスロットです。
 * @slot extension - VToolbarのextensionスロットです。
 * @slot prepend-search - 検索用TextFieldの前に配置されます。
 *
 * @author shisyamo4131
 * @version 1.3.0
 *
 * @updates
 * - version 1.3.0 - 2024-08-12 - 検索用VToolbar直下に`div`を配置し、検索用TextField他をflexアイテム化。
 *                              - `slots.search`を用意し、検索用TextFieldを置換できるように修正。
 * - version 1.2.0 - 2024-07-31 - 検索バーのv-toolbarにdenseを設定。
 * - version 1.1.1 - 2024-07-25 - v-paginationのtotal-visibleを20に設定。
 * - version 1.1.0 - 2024-06-27 - ページネーションをv-footerからv-containerに変更。
 *                              - これに伴ってメインコンテナの高さの計算方法を変更。
 * - version 1.0.0 - 2024-06-25 - 初版作成
 *
 * 更新予定:
 * - VDataTableのitemsPerPageを変更できるようにしたい。
 * - VToolbarのextension機能を利用するかもしれない。
 *
 */
import GTextFieldSearch from '../molecules/inputs/GTextFieldSearch.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextFieldSearch },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    delay: { type: Number, default: 500, required: false },
    extend: { type: Boolean, default: false, required: false },
    items: { type: Array, default: () => [], required: false },
    lazySearch: { type: String, default: undefined, required: false },
    search: { type: String, default: undefined, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      appbarHeight: 48,
      drawer: false,
      internalLazySearch: null,
      internalSearch: null,
      page: 1,
      pageCount: 0,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    defaultAttrs() {
      return {
        class: 'flex-table',
        items: this.items,
        page: this.page,
      }
    },
    defaultOn() {
      return {
        'update:page': ($event) => (this.page = $event),
        'page-count': ($event) => (this.pageCount = $event),
      }
    },
    templateHeight() {
      const viewHeight = this.$vuetify.breakpoint.height
      return viewHeight - this.appbarHeight
    },
    toolbarColor() {
      return this.$vuetify.theme.themes.light.background
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    internalLazySearch(newVal, oldVal) {
      if (newVal === oldVal) return
      this.$emit('update:lazySearch', newVal)
    },
    internalSearch(newVal, oldVal) {
      if (newVal === oldVal) return
      this.$emit('update:search', newVal)
    },
    search: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.internalSearch = newVal
      },
      immediate: true,
    },
  },
}
</script>

<template>
  <v-container
    class="d-flex flex-column"
    :style="{ height: `${templateHeight}px` }"
  >
    <v-navigation-drawer v-model="drawer" absolute right temporary />
    <!-- HEADER -->
    <v-toolbar class="flex-grow-0" :color="toolbarColor" flat dense>
      <div class="d-flex align-center flex-grow-1" style="gap: 8px">
        <!-- slot: prepend-search -->
        <slot name="prepend-search" />
        <slot name="search">
          <g-text-field-search
            v-model="internalSearch"
            :delay="delay"
            :lazy-value.sync="internalLazySearch"
          />
        </slot>
        <!-- slot: append-search -->
        <slot name="append-search" />
        <v-btn icon class="ml-auto">
          <v-icon @click="drawer = !drawer">mdi-filter</v-icon>
        </v-btn>
      </div>
      <template v-if="extend" #extension>
        <slot name="extension" />
      </template>
    </v-toolbar>
    <v-container fluid class="d-flex flex-grow-1 overflow-y-hidden">
      <v-card class="d-flex flex-grow-1" outlined>
        <!-- slot: default -->
        <slot
          name="default"
          v-bind="{
            attrs: defaultAttrs,
            search: internalSearch,
            lazySearch: internalLazySearch,
            on: defaultOn,
          }"
        />
      </v-card>
    </v-container>
    <v-container class="flex-grow-0">
      <v-pagination v-model="page" :length="pageCount" total-visible="20" />
    </v-container>
  </v-container>
</template>

<style></style>
