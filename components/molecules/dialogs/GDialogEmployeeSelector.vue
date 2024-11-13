<script>
/**
 * ## GDialogEmployeeSelector
 *
 * 機能詳細:
 * - 従業員を選択するためのダイアログコンポーネントです。
 * - 従業員を選択するだけのコンポーネントであるため、GDataTable で従業員名のみを表示します。
 *   -> GDataTableEmployees を使用していません。
 * - 選択可能な従業員データは親コンポーネントから `items` で受け取ります。
 * - 従業員の `fullNameKan` での絞り込みが可能です。
 * - 既定では在職中の従業員のみが一覧表示されます。switch の切り替えで退職者も含めることができます。
 *
 * PROPS:
 * - includeExpired - 退職者を含めるかどうかです。.sync 修飾子とともに使用可能です。
 *
 * @author shisyamo4131
 */

import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '~/components/atoms/btns/GBtnSubmitIcon.vue'
import GChipEmployeeStatus from '~/components/atoms/chips/GChipEmployeeStatus.vue'
import GChipGroupKanaFilter from '~/components/atoms/chips/GChipGroupKanaFilter.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnCancelIcon,
    GBtnSubmitIcon,
    GChipGroupKanaFilter,
    GSwitch,
    GChipEmployeeStatus,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    customFilter: { type: Function, default: undefined, required: false },
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
      scrollTargetRef: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * GDataTable の headers プロパティにバインドされる配列を返します。
     * - 従業員を選択するコンポーネントであるため、カラムは従業員名（略称）に固定されます。
     */
    headers() {
      return [{ text: '従業員名', value: 'fullName' }]
    },
    /**
     * GDataTableEmployees の items プロパティにバインドされる配列を返します。
     * - props.items から GChipGroupKanaFilter で選択された正規表現に該当するものを抽出します。
     * - data.internalIncludeExpired が false の場合、status が active であるものを抽出します。
     */
    filteredItems() {
      return this.items
        .filter((item) => {
          return !this.customFilter || this.customFilter(item)
        })
        .filter(({ abbr, fullNameKana, status }) => {
          const regexMatch =
            !this.regex ||
            this.regex.test(fullNameKana) ||
            this.regex.test(abbr)
          const statusMatch = this.internalIncludeExpired || status === 'active'
          return regexMatch && statusMatch
        })
        .sort((a, b) => a.fullNameKana.localeCompare(b.fullNameKana))
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
          ><v-icon>mdi-account</v-icon>従業員選択</v-toolbar-title
        >
      </v-toolbar>
      <v-divider />
      <v-toolbar dense flat class="flex-grow-0">
        <slot name="filter" v-bind="{ includeExpired: internalIncludeExpired }">
          <v-spacer />
          <g-switch
            v-model="internalIncludeExpired"
            class="mt-0"
            label="退職者を含める"
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
                    <g-chip-employee-status
                      v-if="item.status === 'expired'"
                      class="ml-2"
                      :value="item.status"
                      x-small
                    />
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ item.fullNameKana }}
                  </v-list-item-subtitle>
                  <slot name="third-line" v-bind="{ item }" />
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
            v-for="(employee, index) of selectedItems"
            :key="index"
            small
            label
            close
            @click:close="onClickChipClose(index)"
          >
            {{ employee.abbr }}
          </v-chip>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions class="justify-space-between">
        <g-btn-cancel-icon @click="onClickCancel" />
        <g-btn-submit-icon
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
