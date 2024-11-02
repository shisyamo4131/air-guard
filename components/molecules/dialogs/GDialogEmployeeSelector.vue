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
 * @author shisyamo4131
 */

import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '~/components/atoms/btns/GBtnSubmitIcon.vue'
import GChipEmployeeStatus from '~/components/atoms/chips/GChipEmployeeStatus.vue'
import GChipGroupKanaFilter from '~/components/atoms/chips/GChipGroupKanaFilter.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTable,
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
      includeExpired: false,
      regex: null,
      selectedItems: [],
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
      return [{ text: '従業員名', value: 'abbr' }]
    },
    /**
     * GDataTableEmployees の items プロパティにバインドされる配列を返します。
     * - props.items から GChipGroupKanaFilter で選択された正規表現に該当するものを抽出します。
     * - data.includeExpired が false の場合、status が active であるものを抽出します。
     */
    filteredItems() {
      return structuredClone(this.items)
        .filter(({ fullNameKana, status }) => {
          const regexMatch = !this.regex || this.regex.test(fullNameKana)
          const statusMatch = this.includeExpired || status === 'active'
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
     * - 値を input イベントで emit します。
     */
    dialog(v) {
      if (!v) {
        this.selectedItems.splice(0)
        this.$refs.filter.initialize()
      }
      this.$emit('input', v)
    },
    includeExpired(newVal) {
      if (newVal) return
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
      <v-container class="d-flex justify-end">
        <g-switch
          v-model="includeExpired"
          class="mt-0"
          label="退職者を含める"
          hide-details
        />
      </v-container>
      <v-divider />
      <v-card-text class="d-flex pa-0" style="height: 368px">
        <g-data-table
          v-model="selectedItems"
          class="flex-table"
          checkbox-color="primary"
          disable-sort
          :headers="headers"
          :items="filteredItems"
          :items-per-page="-1"
          :mobile-breakpoint="0"
          show-select
        >
          <template #[`item.abbr`]="{ item }">
            {{ item.fullName }}
            <g-chip-employee-status
              v-if="item.status === 'expired'"
              class="ml-2"
              :value="item.status"
              x-small
            />
          </template>
        </g-data-table>
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
