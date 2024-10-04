<script>
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '~/components/atoms/btns/GBtnSubmitIcon.vue'
import GChipEmployeeStatus from '~/components/atoms/chips/GChipEmployeeStatus.vue'
import GChipGroupKanaFilter from '~/components/atoms/chips/GChipGroupKanaFilter.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'

/**
 * ## GDialogEmployeeSelector
 *
 * - 従業員を選択するためのダイアログコンポーネントです。
 * - 選択可能な従業員データは親コンポーネントから `items` で受け取ります。
 * - 従業員の `fullNameKan` での絞り込みが可能です。
 * - 既定では在職中の従業員のみが一覧表示されます。switch の切り替えで退職者も含めることができます。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-04 - 初版作成
 */

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
    headers() {
      return [{ text: '従業員名', value: 'abbr' }]
    },
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
    dialog(v) {
      if (v) return
      this.selectedItems.splice(0)
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickCancel() {
      this.dialog = false
    },
    onClickSubmit() {
      this.$emit('click:submit', structuredClone(this.selectedItems))
      this.dialog = false
    },
  },
}
</script>

<template>
  <v-dialog v-model="dialog" scrollable max-width="360">
    <template #activator="{ attrs, on }">
      <slot name="activator" v-bind="{ attrs, on }" />
    </template>
    <v-card>
      <v-card-title class="g-card__title">従業員選択</v-card-title>
      <v-divider />
      <v-card-text class="pa-0 d-flex flex-grow-1" style="height: 480px">
        <v-container style="width: 68px">
          <g-chip-group-kana-filter
            :chip-options="{ small: true, label: true }"
            column
            :regex.sync="regex"
          />
        </v-container>
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
            {{ item.abbr }}
            <g-chip-employee-status
              v-if="item.status === 'expired'"
              class="ml-2"
              :value="item.status"
              x-small
            />
          </template>
        </g-data-table>
      </v-card-text>
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

<style></style>
