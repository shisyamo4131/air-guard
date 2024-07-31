<script>
/**
 * # pages.SitesIndex
 *
 * 現場情報の一覧ページです。
 *
 * @author shisyamo4131
 * @version 1.1.0
 *
 * @updates
 * - version 1.1.1 - 2024-07-31 - `GDataTableSites`への`sort-by`と`sort-desc`を削除。
 * - version 1.1.0 - 2024-07-25 - Vuex.sitesの実装により仕様変更。
 * - version 1.0.0 - 2024-07-10 - 初版作成
 */
import { where } from 'firebase/firestore'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
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
    GSwitch,
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
      includeExpired: false,
      items: {
        active: this.$store.state.sites.items,
        inActive: [],
      },
      listener: this.$Site(),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    filteredItems() {
      const combined = this.items.active.concat(this.items.inActive)
      return combined.filter((item) => {
        const customer = this.customerId
          ? item.customerId === this.customerId
          : true
        return !!customer
      })
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    includeExpired: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.subscribe()
      },
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.listener.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    subscribe() {
      this.items.inActive = this.listener.subscribe(undefined, [
        where('status', '!=', 'active'),
      ])
    },
  },
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
        <g-switch
          v-model="includeExpired"
          class="flex-grow-0"
          label="稼働終了を含める"
          hide-details
          :disabled="includeExpired"
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
