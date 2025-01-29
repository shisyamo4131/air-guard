<script>
/**
 * 現場選択ダイアログコンポーネント
 * @author shisyamo4131
 * @refact 2025-01-29
 */

import GBtnCancel from '~/components/atoms/btns/GBtnCancel.vue'
import GBtnSubmit from '~/components/atoms/btns/GBtnSubmit.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GPagination from '~/components/atoms/paginations/GPagination.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnCancel,
    GBtnSubmit,
    GSwitch,
    GPagination,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 追加でフィルタリングするための関数です。
     * 引数に item が引き渡されます。
     */
    customFilter: { type: Function, default: undefined, required: false },

    /**
     * 稼働終了分の現場も一覧に表示するかどうかを指定します。
     * 既定値は false で、現在稼働中の現場のみ一覧に表示されます。
     */
    includeExpired: { type: Boolean, default: false, required: false },

    /**
     * ダイアログの最大幅です。
     */
    maxWidth: { type: [String, Number], default: 480, required: false },

    /**
     * 選択を単一にするかどうかです。既定値は false です。
     */
    singleSelect: { type: Boolean, default: false, required: false },

    /**
     * ダイアログの開閉状態です。v-model のバインド値になります。
     */
    value: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * コンポーネント内部で使用する、ダイアログの開閉状態を制御するための変数です。
       */
      dialog: false,

      /**
       * コンポーネント内部で使用する、稼働終了分の現場を一覧表示するかどうかです。
       */
      internalIncludeExpired: false,

      /**
       * ページネーションのページ番号です。
       */
      page: 1,

      /**
       * ページネーションの長さです。
       */
      pageCount: 0,

      /**
       * フィルタリング用文字列です。
       */
      search: null,

      /**
       * 選択された現場の配列です。
       */
      selectedItems: [],
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * コンポーネントが使用する `稼働終了分の現場を一覧に表示するかどうか` です。
     * - 値が更新されると `update:includeExpired` イベントを emit します。
     */
    computedIncludeExpired: {
      get() {
        return this.internalIncludeExpired
      },
      set(v) {
        this.internalIncludeExpired = v
        this.$emit('update:includeExpired', v)
      },
    },

    /**
     * GDataTableEmployees の items プロパティにバインドされる配列を返します。
     * - props.items から GChipGroupKanaFilter で選択された正規表現に該当するものを抽出します。
     * - computedIncludeExpired が false の場合、status が active であるものを抽出します。
     */
    filteredItems() {
      return this.items
        .filter((item) => {
          return !this.customFilter || this.customFilter(item)
        })
        .filter(({ status }) => {
          const statusMatch = this.computedIncludeExpired || status === 'active'
          return statusMatch
        })
    },

    /**
     * Vuex から取得した現場の配列を返します。
     */
    items() {
      return this.$store.getters['sites/items']
    },
  },

  /***************************************************************************
   * WATCHERS
   ***************************************************************************/
  watch: {
    /**
     * data.dialog を監視します。
     * - コンポーネントの状態を初期化します。
     * - 値を input イベントで emit します。
     */
    dialog(v) {
      if (!v) this._initialize()
      this.$emit('input', v)
    },

    /**
     * props.includeExpired を data.internalIncludeExpired と同期させます。
     */
    includeExpired: {
      handler(v) {
        this.internalIncludeExpired = v
      },
      immediate: true,
    },

    /**
     * props.value を監視します。
     * - 値を data.dialog に同期します。
     */
    value: {
      handler(v) {
        this.dialog = v
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * submit ボタンがクリックされた時の処理です。
     * - data.selectedItems の内容を複製して click:submit イベントで emit します。
     * - data.dialog を false に更新します。
     */
    onClickSubmit() {
      this.$emit('click:submit', structuredClone(this.selectedItems))
      this.dialog = false
    },

    onClickChipClose(index) {
      this.selectedItems.splice(index, 1)
    },

    /**
     * コンポーネントの状態を初期化します。
     */
    _initialize() {
      this.selectedItems.splice(0)
      this.search = null
      this.page = 1
      this.computedIncludeExpired = false
      this.scrollTo()
    },

    /**
     * スクロール位置を指定されたポジションに移動します。
     */
    scrollTo(position = 0) {
      const ref = this.$refs['scroll-target']
      if (!ref) return
      ref.$el.scrollTop = position
    },
  },
}
</script>

<template>
  <v-dialog
    v-bind="$attrs"
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.mobile"
    :max-width="maxWidth"
    scrollable
    v-on="$listeners"
  >
    <template #activator="{ attrs, on }">
      <slot name="activator" v-bind="{ attrs, on, items }" />
    </template>
    <v-card :tile="$vuetify.breakpoint.mobile">
      <v-toolbar class="flex-grow-0" color="primary" dark dense flat>
        <v-toolbar-title>
          <slot name="title"> 現場選択 </slot>
        </v-toolbar-title>
        <slot name="append-title" />
      </v-toolbar>
      <v-divider />
      <v-toolbar dense flat class="flex-grow-0">
        <v-text-field
          v-model="search"
          hide-details
          prepend-inner-icon="mdi-magnify"
          placeholder="SEARCH"
        />
        <v-spacer />
        <g-switch
          v-model="computedIncludeExpired"
          class="mt-0"
          label="終了分を含める"
          hide-details
        />
      </v-toolbar>
      <v-divider />
      <v-card-text class="d-flex flex-column pa-0" style="height: 480px">
        <v-data-iterator
          ref="scroll-target"
          v-model="selectedItems"
          class="flex-grow-1 overflow-y-auto"
          hide-default-footer
          :items="filteredItems"
          item-key="docId"
          :mobile-breakpoint="0"
          :page.sync="page"
          :search="search"
          :single-select="singleSelect"
          @page-count="pageCount = $event"
        >
          <template #default="props">
            <template v-for="(item, index) of props.items">
              <v-list-item
                :key="`item-${index}`"
                @click="props.select(item, !props.isSelected(item))"
              >
                <v-list-item-action>
                  <v-checkbox
                    :input-value="props.isSelected(item)"
                    color="primary"
                  ></v-checkbox>
                </v-list-item-action>
                <slot name="prepend" v-bind="{ item }" />
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.abbr }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{
                      $store.getters['customers/get'](item.customerId)?.abbr ||
                      'N/A'
                    }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <slot name="append" v-bind="{ item }" />
              </v-list-item>
              <v-divider :key="`div-${index}`" />
            </template>
          </template>
        </v-data-iterator>
        <g-pagination v-model="page" :length="pageCount" />
      </v-card-text>
      <v-card-actions class="justify-space-between">
        <g-btn-cancel icon @click="dialog = false" />
        <g-btn-submit
          icon
          color="primary"
          :disabled="!selectedItems.length"
          @click="onClickSubmit"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style></style>
