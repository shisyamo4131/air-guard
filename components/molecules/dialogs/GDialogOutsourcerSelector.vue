<script>
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '~/components/atoms/btns/GBtnSubmitIcon.vue'
import GChipOutsourcerStatus from '~/components/atoms/chips/GChipOutsourcerStatus.vue'
import GChipGroupKanaFilter from '~/components/atoms/chips/GChipGroupKanaFilter.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'

/**
 * ## GDialogOutsourcerSelector
 *
 * - 外注先を選択するためのダイアログコンポーネントです。
 * - 選択可能な外注先データは親コンポーネントから `items` で受け取ります。
 * - 外注先の `abbrKana` での絞り込みが可能です。
 * - 既定では取引中の外注先のみが一覧表示されます。switch の切り替えで取引終了分も含めることができます。
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
    GChipOutsourcerStatus,
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
      return [{ text: '外注先名', value: 'abbr' }]
    },
    filteredItems() {
      return structuredClone(this.items)
        .filter(({ abbrKana, status }) => {
          const regexMatch = !this.regex || this.regex.test(abbrKana)
          const statusMatch = this.includeExpired || status === 'active'
          return regexMatch && statusMatch
        })
        .sort((a, b) => a.abbrKana.localeCompare(b.abbrKana))
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
      <v-card-title class="g-card__title">外注先選択</v-card-title>
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
            <g-chip-outsourcer-status
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
          label="取引終了を含める"
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
