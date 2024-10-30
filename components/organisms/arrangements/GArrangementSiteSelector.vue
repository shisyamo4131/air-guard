<script>
/**
 * ## GArrangementSiteSelector
 *
 * 配置管理上で現場を選択するためのコンポーネントです。
 * - 現場のみでなく、勤務区分も選択します。
 * - 確定ボタンをクリックすると { siteId, workShift } オブジェクトを emit します。
 *
 * @author shisyamo4131
 */
import { mapGetters } from 'vuex'
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '~/components/atoms/btns/GBtnSubmitIcon.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GRadioGroupWorkShift from '~/components/molecules/inputs/GRadioGroupWorkShift.vue'
import GTextFieldSearch from '~/components/molecules/inputs/GTextFieldSearch.vue'
import GDataTableSites from '~/components/molecules/tables/GDataTableSites.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTableSites,
    GTextFieldSearch,
    GBtnSubmitIcon,
    GBtnCancelIcon,
    GSwitch,
    GRadioGroupWorkShift,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      includesExpired: false,
      page: 1,
      pageCount: 0,
      selectedItems: [],
      search: null,
      workShift: 'day',
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    ...mapGetters('sites', { items: 'items' }),
    filteredItems() {
      return this.items.filter(({ status }) => {
        return this.includesExpired || status === 'active'
      })
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (v) return
      this.selectedItems.splice(0)
      this.search = null
      this.page = 1
      this.$refs.table.scrollToTop()
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickSubmit() {
      if (!this.selectedItems.length) return
      const siteId = this.selectedItems[0].docId
      const workShift = this.workShift
      this.$emit('selected', { siteId, workShift })
      this.dialog = false
    },
  },
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="720" scrollable>
    <template #activator="{ attrs, on }">
      <slot name="activator" v-bind="{ attrs, on }" />
    </template>
    <v-card class="d-flex flex-column">
      <v-card-title class="g-card__title">現場選択</v-card-title>
      <v-toolbar dense flat>
        <g-text-field-search v-model="search" />
      </v-toolbar>
      <v-container class="px-4 py-0 d-flex justify-end">
        <g-switch
          v-model="includesExpired"
          class="mt-0"
          hide-details
          label="終了現場を含める"
        />
      </v-container>
      <v-container class="px-4 d-flex overflow-y-hidden">
        <g-data-table-sites
          ref="table"
          v-model="selectedItems"
          class="flex-table"
          checkbox-color="primary"
          :items="filteredItems"
          :search="search"
          show-select
          single-select
          :page.sync="page"
          @page-count="pageCount = $event"
        />
      </v-container>
      <v-container style="max-width: 90%">
        <v-pagination v-model="page" :length="pageCount" />
      </v-container>
      <v-divider />
      <v-container class="px-4 py-0 d-flex justify-end">
        <g-radio-group-work-shift v-model="workShift" row />
      </v-container>
      <v-divider />
      <v-card-actions class="justify-space-between">
        <g-btn-cancel-icon @click="dialog = false" />
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
