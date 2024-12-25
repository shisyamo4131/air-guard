<script>
/**
 * 各種インデックスページ用のテンプレートです。
 * @author shisyamo4131
 */
import GBtnFilterIcon from '../atoms/btns/GBtnFilterIcon.vue'
import GBtnRegistIcon from '../atoms/btns/GBtnRegistIcon.vue'
import GTextFieldSearch from '../molecules/inputs/GTextFieldSearch.vue'
import GTemplateDefault from './GTemplateDefault.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextFieldSearch,
    GTemplateDefault,
    GBtnRegistIcon,
    GBtnFilterIcon,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * テンプレートのカラーです。
     */
    color: { type: String, default: 'secondary', required: false },

    /**
     * 検索用テキストボックスの入力内容を lazySearch に反映させる遅延時間（ミリ秒）です。
     */
    delay: { type: Number, default: 500, required: false },

    /**
     * フィルターボタンを使用不可にします。
     */
    disableFilter: { type: Boolean, default: false, required: false },

    /**
     * 登録ボタンを使用不可にします。
     */
    disableRegist: { type: Boolean, default: false, required: false },

    /**
     * ツールバーを拡張します。
     * 拡張されたツールバーにコンポーネントを配置するには nav スロットを使用します。
     */
    extend: { type: Boolean, default: false, required: false },

    /**
     * フィルターボタンを非表示にします。
     */
    hideFilter: { type: Boolean, default: false, required: false },

    /**
     * ページネーションを非表示にします。
     */
    hidePagination: { type: Boolean, default: false, required: false },

    /**
     * 登録ボタンを非表示にします。
     */
    hideRegist: { type: Boolean, default: false, required: false },

    /**
     * 一覧表示するアイテム（配列）です。
     * default スロットから提供されます。
     */
    items: { type: Array, default: () => [], required: false },

    /**
     * 画面のタイトルです。
     */
    label: { type: String, default: undefined, required: false },

    /**
     * 検索用テキストボックスの値が delay で指定された時間だけ遅延して反映されます。
     * .sync 修飾子とともに使用します。
     */
    lazySearch: { type: String, default: undefined, required: false },

    /**
     * タイトルを非表示にします。
     */
    noLabel: { type: Boolean, default: false, required: false },

    /**
     * 検索用テキストボックスの値です。
     * .sync 修飾子が使用可能です。
     */
    search: { type: String, default: undefined, required: false },

    totalVisible: {
      type: [String, Number],
      default: undefined,
      required: false,
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * フィルタリング用ナビゲーションの開閉状態です。
       */
      drawer: false,

      /**
       * 遅延検索文字列の内部値です。
       */
      internalLazySearch: null,

      /**
       * 検索文字列の内部値です。
       */
      internalSearch: null,

      /**
       * ページネーション、データテーブルのページ番号です。
       */
      page: 1,

      /**
       * ページネーション、データテーブルの総ページ数です。
       */
      pageCount: 0,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * デフォルトスロットで提供するプロパティを返します。
     * 提供するプロパティは DataTable コンポーネントで使用されることを想定しています。
     */
    defaultSlotProps() {
      return {
        attrs: {
          class: 'flex-table',
          items: this.items,
          page: this.page,
          search: this.internalSearch,
        },
        on: {
          'update:page': ($event) => (this.page = $event),
          'page-count': ($event) => (this.pageCount = $event),
        },
        lazySearch: this.internalLazySearch,
      }
    },

    /**
     * filter-button スロットで提供するプロパティを返します。
     */
    filterButtonSlotProps() {
      return {
        attrs: { color: this.color, disabled: this.disableFilter },
        on: { click: this.toggleDrawer },
        show: !this.hideFilter,
      }
    },

    /**
     * regist-button スロットで提供するプロパティを返します。
     */
    registButtonSlotProps() {
      return {
        attrs: { color: this.color, disabled: this.disableRegist },
        on: { click: () => this.$emit('click:regist') },
        show: !this.hideRegist,
      }
    },

    /**
     * search, prepend-search, append-search スロットで提供するプロパティを返します。
     */
    searchSlotProps() {
      return {
        attrs: {
          delay: this.delay,
          lazyValue: this.internalLazySearch,
          value: this.internalSearch,
        },
        on: {
          input: ($event) => (this.internalSearch = $event),
          'update:lazyValue': ($event) => (this.internalLazySearch = $event),
        },
        inputAttrs: {
          flat: true,
          outlined: false,
          soloInverted: true,
          hideDetails: true,
        },
      }
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * 遅延検索文字列が更新されたら `update:lazySearch` を emit します。
     */
    internalLazySearch(newVal, oldVal) {
      if (newVal === oldVal) return
      this.$emit('update:lazySearch', newVal)
    },

    /**
     * 検索文字列が更新されたら `update:search` を emit します。
     */
    internalSearch(newVal, oldVal) {
      if (newVal === oldVal) return
      this.$emit('update:search', newVal)
    },

    /**
     * props.search の内容を直ちに検索用文字列に反映させます。
     */
    search: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.internalSearch = newVal
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * フィルタリング用ナビゲーションドロワーを開きます。
     */
    openDrawer() {
      this.drawer = true
    },

    /**
     * フィルタリング用ナビゲーションドロワーを閉じます。
     */
    closeDrawer() {
      this.drawer = false
    },

    /**
     * フィルタリング用ナビゲーションドロワーの開閉状態を切り替えます。
     */
    toggleDrawer() {
      this.drawer = !this.drawer
    },
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container class="pa-0 pa-sm-3" :style="{ height: `${height}px` }">
      <v-card class="d-flex flex-column" height="100%" flat>
        <v-navigation-drawer
          v-model="drawer"
          class="rounded-t-0"
          fixed
          right
          temporary
        >
          <div class="pa-4 d-flex flex-column" style="height: 100%">
            <div class="flex-grow-1">
              <!-- slot: nav -->
              <slot name="nav" v-bind="{ color }" />
            </div>
            <div class="flex-grow-0 d-flex flex-column" style="gap: 12px">
              <v-btn block :color="color" @click="$emit('click:clear')"
                >クリア</v-btn
              >
              <v-btn block :color="color" @click="closeDrawer">閉じる</v-btn>
            </div>
          </div>
        </v-navigation-drawer>

        <!-- LABEL -->
        <v-toolbar
          v-show="!noLabel"
          class="flex-grow-0"
          :color="color"
          dark
          dense
          flat
        >
          <!-- slot: prepend-label -->
          <slot name="prepend-label" />

          <v-toolbar-title>{{ label }}</v-toolbar-title>

          <!-- slot: append-label -->
          <slot name="append-label" />
        </v-toolbar>

        <!-- HEADER -->
        <v-toolbar class="flex-grow-0" flat>
          <div class="d-flex align-center flex-grow-1" style="gap: 8px">
            <!-- slot: prepend-search -->
            <slot name="prepend-search" v-bind="searchSlotProps" />

            <!-- slot: search -->
            <slot name="search" v-bind="searchSlotProps">
              <g-text-field-search
                v-bind="searchSlotProps.attrs"
                :delay="delay"
                v-on="searchSlotProps.on"
              />
            </slot>

            <!-- slot: append-search -->
            <slot name="append-search" v-bind="searchSlotProps" />

            <!-- 登録ボタン -->
            <slot name="regist-button" v-bind="registButtonSlotProps">
              <g-btn-regist-icon
                v-show="registButtonSlotProps.show"
                v-bind="registButtonSlotProps.attrs"
                v-on="registButtonSlotProps.on"
              />
            </slot>

            <!-- フィルターボタン -->
            <slot name="filter-button" v-bind="filterButtonSlotProps">
              <g-btn-filter-icon
                v-show="filterButtonSlotProps.show"
                v-bind="filterButtonSlotProps.attrs"
                v-on="filterButtonSlotProps.on"
              />
            </slot>
          </div>

          <!-- slot: extension -->
          <template v-if="extend" #extension>
            <slot name="extension" />
          </template>
        </v-toolbar>
        <v-divider />
        <div class="d-flex flex-grow-1 overflow-y-hidden">
          <!-- slot: default -->
          <slot name="default" v-bind="defaultSlotProps" />
        </div>

        <!-- PAGINATION -->
        <v-toolbar class="flex-grow-0" flat>
          <v-row justify="center">
            <v-col cols="10">
              <v-pagination
                v-model="page"
                :color="color"
                :length="pageCount"
                :total-visible="totalVisible"
              />
            </v-col>
          </v-row>
        </v-toolbar>
      </v-card>
    </v-container>
  </g-template-default>
</template>

<style></style>
