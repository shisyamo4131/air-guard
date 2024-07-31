<script>
/**
 * # pages.SitesIndex
 *
 * 現場情報の一覧ページです。
 *
 * @author shisyamo4131
 * @version 1.2.0
 *
 * @updates
 * - version 1.2.0 - 2024-07-31 - `GDataTableSites`への`sort-by`と`sort-desc`を削除。
 *                              - 稼働終了現場の取得・表示に関する機能を削除
 *                                -> 稼働終了現場の一覧画面を別に実装したため。
 * - version 1.1.0 - 2024-07-25 - Vuex.sitesの実装により仕様変更。
 * - version 1.0.0 - 2024-07-10 - 初版作成
 */
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GDialogEditor from '~/components/molecules/dialogs/GDialogEditor.vue'
import GDataTableSites from '~/components/molecules/tables/GDataTableSites.vue'
import GAutocompleteCustomer from '~/components/atoms/inputs/GAutocompleteCustomer.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SitesIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateIndex,
    GBtnRegistIcon,
    GInputSite,
    GDialogEditor,
    GDataTableSites,
    GAutocompleteCustomer,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      customerId: '',
      items: this.$store.state.sites.items,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    filteredItems() {
      return this.items.filter(({ customerId }) => {
        return this.customerId ? customerId === this.customerId : true
      })
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {},
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {},
}
</script>

<template>
  <g-template-index extend :items="filteredItems">
    <template #append-search>
      <g-dialog-editor
        model-id="Site"
        label="現場"
        @submit:complete="$router.push(`/sites/${$event.item.docId}`)"
      >
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-site v-bind="attrs" v-on="on" />
        </template>
      </g-dialog-editor>
    </template>
    <template #extension>
      <div
        class="d-flex align-center flex-nowrap flex-grow-1"
        style="gap: 12px"
      >
        <g-autocomplete-customer
          v-model="customerId"
          label="取引先"
          class="flex-grow-1"
          clearable
          hide-details
        />
      </div>
    </template>
    <template #default="{ attrs, search, on }">
      <g-data-table-sites
        v-bind="attrs"
        :search="search"
        @click:row="$router.push(`/sites/${$event.docId}`)"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
