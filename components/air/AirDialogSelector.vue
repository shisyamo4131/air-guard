<script>
/**
 * 複数のアイテムから単一または複数のアイテムを選択するためのダイアログコンポーネントです。
 *
 * [特徴]
 * - アイテム群の表示をダイアログで行う為、ダイアログコンポーネントの高さは
 *   アプリケーションの高さの 90％ で固定されます。
 *   但し、モバイル表示の場合はフルスクリーン表示になります。
 *
 * [使い方]
 * 1. ダイアログの起動には activator スロットが使用可能です。
 * 2. props.items に配列を渡し、初期表示するアイテム群を指定します。（オプション）
 *    item スロットで提供されるプロパティを使用してアイテムを表示してください。
 * 3. props.fetcher を指定すると検索のためのツールバーが表示されます。
 *    検索文字列が入力されると props.fetcher の実行結果で取得した配列が
 *    props.items に代わって提供されます。
 * 4. アイテムが選択され、確定ボタンがクリックされると、選択されたアイテムが
 *    selected イベントで emit されます。
 *
 * [fetcherParams]
 * props.fetcher の第2引数として引き渡されるオブジェクトです。
 * 親コンポーネントから追加でパラメータを指定する必要がある場合に使用します。
 * このオブジェクトは watcher によって監視されており、内容の変更を検知すると
 * props.fetcher が再実行されます。
 *
 * [customFilter]
 * props.items または props.fetcher の実行結果で取得した配列をフィルタリングするための
 * 関数です。
 * customFilter の結果で得られる配列が、items または item スロットで提供されます。
 *
 * @author shisyamo4131
 * @refact 2025-02-12
 */
import AirRenderlessDelayInput from '~/components/air/AirRenderlessDelayInput.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { AirRenderlessDelayInput },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    // キャンセルボタンのアイコンです。
    cancelIcon: { type: String, default: 'mdi-close', required: false },

    /**
     * VItemGroup 内で使用している VCol のオプションです。
     */
    colOptions: {
      type: Object,
      default: () => ({ cols: 12, md: 6 }),
      required: false,
    },

    /**
     * items または fetcher によって抽出されたアイテムをフィルタリングするための関数です。
     * - コンポーネント内部ではすべてのアイテムを保有しますが、
     *   UI の為に提供されるアイテムはこの関数でフィルタリングされます。
     * (items, search) => []
     */
    customFilter: {
      type: Function,
      default: (items, search) => items,
      required: false,
    },

    /**
     * 検索文字列として入力された値で fetcher を実行するまでの遅延時間（ミリ秒）です。
     */
    delay: { type: [String, Number], default: 500, required: false },

    /**
     * 選択可能なアイテムを外部から取得するための関数を指定します。
     * - fetcher が指定されると、コンポーネントに検索窓が表示されます。
     * - fetcher は検索文字列が更新されるたびに実行されます。
     * - fetcher が実行されると、選択可能なアイテムは props.items より優先されます。
     * (search, fetchParams) => Promise<Array>
     */
    fetcher: { type: Function, default: undefined, required: false },

    /**
     * fetcher の第二引数として引き渡されるパラメータです。
     * - watcher によって内容が監視され、変更が生じるとアイテムの再クエリを行います。
     */
    fetchParams: { type: Object, default: () => ({}), required: false },

    /**
     * 選択可能なアイテムの配列です。
     * - fetcher によるクエリが実行されると、選択可能なアイテムは fetcher の
     *   実行結果に置き換わります。
     * - activator スロットで items プロパティとして提供されます。
     */
    items: { type: Array, default: () => [], required: false },

    // ダイアログ内のカードタイトルです。
    label: { type: String, default: undefined, required: false },

    /**
     * 検索文字列として有効にする最低文字数です。
     */
    minLength: { type: [String, Number], default: 2, required: false },

    // 複数のアイテムを選択可能にします。
    multiple: { type: Boolean, default: false, required: false },

    // アイテムを並び替えます。
    sortBy: { type: [String, Array], default: undefined, required: false },

    // アイテムの並び替えについて昇順・降順を指定します。
    sortDesc: { type: [Boolean, Array], default: undefined, required: false },

    // 確定ボタンのアイコンです。
    submitIcon: { type: String, default: 'mdi-check', required: false },

    // ダイアログの開閉を制御します。
    value: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      // コンポーネント内部で管理するアイテムの配列です。
      internalItems: [],

      // コンポーネント内部で使用する検索文字列（遅延）です。
      internalLazySearch: null,

      // コンポーネント内部で管理するダイアログ制御用変数です。
      internalValue: false,

      // fetcher によるクエリ処理を実行中であることを表すフラグです。
      loading: false,

      // コンポーネント内部で使用する選択されたアイテムです。
      selectedItem: undefined,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * data.internalItems を props.sortBy および props.sortDesc の指定に合わせて
     * 並び替えた配列を返します。
     */
    computedItems() {
      // sortBy の指定がなければ filterdItems をそのまま返す。
      if (!this.sortBy || this.sortBy.length === 0) {
        return this.internalItems
      }

      // sortBy の指定があれば、条件に従って配列を並び替えて返す。
      return this.internalItems.slice().sort((a, b) => {
        if (Array.isArray(this.sortBy)) {
          for (let i = 0; i < this.sortBy.length; i++) {
            const key = this.sortBy[i]
            const desc = Array.isArray(this.sortDesc)
              ? this.sortDesc[i]
              : this.sortDesc
            const order = desc ? -1 : 1

            if (a[key] < b[key]) return -1 * order
            if (a[key] > b[key]) return 1 * order
          }
          return 0
        } else {
          const order = this.sortDesc ? -1 : 1
          return a[this.sortBy] < b[this.sortBy]
            ? -1 * order
            : a[this.sortBy] > b[this.sortBy]
            ? 1 * order
            : 0
        }
      })
    },

    filterdItems() {
      return this.customFilter(this.computedItems, this.lazySearch)
    },

    /**
     * アイテムが選択されているかどうかを返します。
     */
    isItemSelected() {
      if (!this.selectedItem) return false
      if (Array.isArray(this.selectedItem) && this.selectedItem.length === 0)
        return false
      return true
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * props.fetchParams を監視し、内容に変更が生じたら reloadItems を実行します。
     */
    fetchParams: {
      handler(v) {
        this.reloadItems()
      },
      deep: true,
    },

    /**
     * data.internalItems を監視し、値が更新されたらコンポーネントを初期化します。
     * - `reloaded` イベントを emit します。
     */
    internalItems(v) {
      this.initializeSelection()
      this.$emit('reloaded')
    },

    /**
     * data.internalLazySearch を監視します。
     * - lazy-search イベントを emit し、reloadItems を実行します。
     */
    internalLazySearch: {
      handler(v) {
        this.$emit('lazy-search', v)
        this.reloadItems()
      },
    },

    /**
     * data.internalValue を監視します。
     * - false に更新されたらコンポーネントを初期化します。
     * - input イベントを emit します。
     */
    internalValue(v) {
      if (!v) {
        this.initializeSelection()
        this.internalLazySearch = null
      }
      this.$emit('input', v)
    },

    // props.items を監視し、値が更新されたら data.internalItems と同期します。
    items: {
      handler(v) {
        this.internalItems = v
      },
      immediate: true,
    },

    // props.value を監視し、値を data.internalValue と同期します。
    value: {
      handler(v) {
        this.internalValue = v
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * コンポーネントの選択状態を初期化し、スクロール位置を最上部に戻します。
     */
    initializeSelection() {
      this.selectedItem = this.multiple ? [] : null
      const element = this.$refs?.['scroll-container'] || null
      if (element) {
        this.$vuetify.goTo(this, { container: this.$refs['scroll-container'] })
      }
    },

    // ダイアログを開きます。（activator スロット以外でのダイアログの起動に使用します。）
    open() {
      this.internalValue = true
    },

    /**
     * data.internalItems の内容を更新します。
     * - props.fetcher が指定されていない場合は処理をせずに終了します。
     */
    async reloadItems() {
      if (!this.fetcher) return
      this.loading = true
      try {
        this.internalItems = this.internalLazySearch
          ? await this.fetcher(this.internalLazySearch, this.fetchParams)
          : this.items
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err.message)
      } finally {
        this.loading = false
      }
    },

    /**
     * 確定ボタンがクリックされた時の処理です。；
     * - data.selectedItem を selected イベントで emit します。
     * - ダイアログを終了します。
     */
    submit() {
      this.$emit('selected', this.selectedItem)
      this.internalValue = false
    },
  },
}
</script>

<template>
  <v-dialog
    v-bind="$attrs"
    v-model="internalValue"
    :fullscreen="$vuetify.breakpoint.mobile"
    content-class="air-dialog-selector__height--fixed"
    v-on="$listeners"
  >
    <!-- activator スロットに items を追加して提供 -->
    <template #activator="{ attrs, on }">
      <slot
        name="activator"
        v-bind="{ attrs: { ...attrs, readonly: true }, on }"
      />
    </template>

    <!-- card コンポーネント -->
    <v-card class="d-flex flex-column" height="100%">
      <v-toolbar color="primary" dark dense flat class="flex-grow-0">
        <v-toolbar-title>{{ label }}</v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="internalValue = false"
          ><v-icon>{{ cancelIcon }}</v-icon></v-btn
        >
      </v-toolbar>

      <!-- header スロット -->
      <div class="flex-grow-0">
        <slot name="header" v-bind="{ items }" />
      </div>

      <div v-if="!!fetcher" class="px-6 flex-grow-0">
        <air-renderless-delay-input
          v-slot="{ attrs, on }"
          v-model="internalLazySearch"
          :delay="delay"
          :min-length="minLength"
        >
          <v-text-field
            v-bind="attrs"
            clearable
            :loading="loading"
            prepend-inner-icon="mdi-magnify"
            placeholder="検索"
            v-on="on"
          />
        </air-renderless-delay-input>
      </div>

      <!-- search-extention スロット -->
      <div class="flex-grow-0">
        <slot name="search-extension" v-bind="{ items: computedItems }" />
      </div>

      <v-container class="flex-grow-1 overflow-y-hidden" fluid>
        <slot name="items" v-bind="{ items: filterdItems }">
          <v-item-group
            ref="scroll-container"
            v-model="selectedItem"
            class="overflow-y-auto"
            style="height: 100%"
            :multiple="multiple"
          >
            <v-container>
              <v-row>
                <v-col
                  v-for="(item, index) of filterdItems"
                  :key="index"
                  v-bind="colOptions"
                >
                  <v-item :value="item">
                    <template #default="{ active, toggle }">
                      <slot name="item" v-bind="{ active, toggle, item }" />
                    </template>
                  </v-item>
                </v-col>
              </v-row>
            </v-container>
          </v-item-group>
        </slot>
      </v-container>
      <v-card-actions class="justify-end">
        <v-btn color="primary" :disabled="!isItemSelected" icon @click="submit"
          ><v-icon>{{ submitIcon }}</v-icon></v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style>
.air-dialog-selector__height--fixed:not(.v-dialog--fullscreen) {
  height: 90% !important;
}
</style>
