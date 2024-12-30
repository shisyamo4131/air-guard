<script>
/**
 * ## GDialogOutsourcerSelector
 *
 * - 外注先を選択するためのダイアログコンポーネントです。
 * - 選択可能な外注先データは親コンポーネントから `items` で受け取ります。
 * - 外注先の `abbrKana` での絞り込みが可能です。
 * - 既定では取引中の外注先のみが一覧表示されます。switch の切り替えで取引終了分も含めることができます。
 *
 * @author shisyamo4131
 */

import GBtnCancel from '~/components/atoms/btns/GBtnCancel.vue'
import GBtnSubmit from '~/components/atoms/btns/GBtnSubmit.vue'
import GChipOutsourcerStatus from '~/components/atoms/chips/GChipOutsourcerStatus.vue'
import GChipGroupKanaFilter from '~/components/atoms/chips/GChipGroupKanaFilter.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnCancel,
    GBtnSubmit,
    GChipGroupKanaFilter,
    GSwitch,
    GChipOutsourcerStatus,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    includeExpired: { type: Boolean, default: false, required: false },
    items: { type: Array, default: () => [], required: false },
    maxWidth: { type: [String, Number], default: 360, required: false },
    value: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      internalIncludeExpired: false,
      regex: null,
      selectedItems: [],
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      return [{ text: '外注先名', value: 'abbr' }]
    },
    filteredItems() {
      return structuredClone(this.items)
        .filter(({ abbrKana, status }) => {
          const regexMatch = !this.regex || this.regex.test(abbrKana)
          const statusMatch = this.internalIncludeExpired || status === 'active'
          return regexMatch && statusMatch
        })
        .sort((a, b) => a.abbrKana.localeCompare(b.abbrKana))
    },
  },

  /***************************************************************************
   * WATCHERS
   ***************************************************************************/
  watch: {
    /**
     * data.dialog を監視します。
     * - 値が false に更新されたら data.selectedItems を初期化します。
     * - 値が false に更新されたら GChipGroupKanaFileter の initialize() を実行します。
     * - 値が false に更新されたら VDataIterator のスクロールポジションを top に戻します。
     * - 値が false に更新されたら data.internalIncludeExpired を false にします。
     * - 値を input イベントで emit します。
     */
    dialog(v) {
      if (!v) {
        this.selectedItems.splice(0)
        this.$refs.filter.initialize()
        this.scrollTo()
        this.internalIncludeExpired = false
      }
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
     * data.internalIncludeExpired を監視します。
     * - update:includeExpired イベントを emit します。
     * - false に更新された場合、選択されたアイテムから status が 'active' でないものを除外します。
     */
    internalIncludeExpired(v) {
      this.$emit('update:includeExpired', v)
      if (v) return
      this.selectedItems = this.selectedItems.filter(
        ({ status }) => status === 'active'
      )
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
     * cancel ボタンがクリックされた時の処理です。
     * - data.dialog を false に更新します。
     */
    onClickCancel() {
      this.dialog = false
    },
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
     * VDataIterator のスクロールを初期化
     */
    scrollTo(position = 0) {
      if (this.scrollTargetRef && this.scrollTargetRef.$el) {
        // positionで指定された位置までスクロール
        this.scrollTargetRef.$el.scrollTop = position
      }
    },

    /**
     * 外部から当該コンポーネントを開くためのメソッドです。
     */
    open() {
      this.dialog = true
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
      <slot name="activator" v-bind="{ attrs, on }" />
    </template>
    <v-card :tile="$vuetify.breakpoint.mobile">
      <v-toolbar class="flex-grow-0" color="primary" dark dense flat>
        <v-toolbar-title
          ><v-icon>mdi-account</v-icon>外注先選択</v-toolbar-title
        >
      </v-toolbar>
      <v-divider />
      <v-toolbar dense flat class="flex-grow-0">
        <slot name="filter" v-bind="{ includeExpired: internalIncludeExpired }">
          <v-spacer />
          <g-switch
            v-model="internalIncludeExpired"
            class="mt-0"
            label="取引終了を含める"
            hide-details
          />
        </slot>
      </v-toolbar>
      <v-divider />
      <v-card-text class="d-flex pa-0" style="height: 368px">
        <v-data-iterator
          :ref="(el) => (scrollTargetRef = el)"
          v-model="selectedItems"
          class="flex-grow-1 overflow-y-auto"
          :items="filteredItems"
          :items-per-page="-1"
          item-key="docId"
          :mobile-breakpoint="0"
          hide-default-footer
          single-select
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
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.abbr }}
                    <g-chip-outsourcer-status
                      v-if="item.status === 'expired'"
                      class="ml-2"
                      :value="item.status"
                      x-small
                    />
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.abbrKana }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider :key="`div-${index}`" />
            </template>
          </template>
        </v-data-iterator>
        <div class="filter-container py-1 px-3" style="width: 60px">
          <g-chip-group-kana-filter
            ref="filter"
            :chip-options="{ small: true, label: true }"
            column
            :regex.sync="regex"
          />
        </div>
      </v-card-text>
      <v-divider />
      <v-card-text class="pa-2" style="height: 112px">
        <div class="d-flex flex-wrap" style="gap: 8px">
          <v-chip
            v-for="(outsourcer, index) of selectedItems"
            :key="index"
            small
            label
            close
            @click:close="onClickChipClose(index)"
          >
            {{ outsourcer.abbr }}
          </v-chip>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions class="justify-space-between">
        <g-btn-cancel icon @click="onClickCancel" />
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

<style scoped>
/* GChipKanaFileter 内の VChip が既定で保有する右側のパディングを削除 */
.filter-container >>> .v-chip {
  margin-right: 0px !important;
}
</style>
