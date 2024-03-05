<script>
import { limit, orderBy, where } from 'firebase/firestore'
import ASwitch from '~/components/atoms/inputs/ASwitch.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GDataTableSites from '~/components/molecules/tables/GDataTableSites.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GAutocompleteCustomer from '~/components/molecules/inputs/GAutocompleteCustomer.vue'
/**
 * ### pages.sites.index
 * @author shisyamo4131
 */
export default {
  name: 'SitesIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputSite,
    GTemplateIndex,
    ASwitch,
    GDataTableSites,
    GAutocompleteCustomer,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app }) {
    const model = app.$Site()
    const defaultConstraints = [
      where('status', '==', 'active'),
      orderBy('updateAt', 'desc'),
      limit(10),
    ]
    const items = model.subscribe(undefined, defaultConstraints)
    return { model, defaultConstraints, items }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      customerId: undefined,
      includeExpired: false,
      lazySearch: null,
      loading: false,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    filteredItems() {
      return this.items
        .filter((item) => {
          if (this.includeExpired) return true
          return item.status === 'active'
        })
        .filter((item) => {
          if (!this.customerId) return true
          return item.customer.docId === this.customerId
        })
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    lazySearch(v) {
      const ngram = v || undefined
      const constraints = v ? [] : this.defaultConstraints
      this.items = this.model.subscribe(ngram, constraints)
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.model.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {},
}
</script>

<template>
  <g-template-index
    label="現場管理"
    :items="filteredItems"
    :lazy-search.sync="lazySearch"
    :loading="loading"
    :model="model"
    regist-at-page
    :search-drawer-badge="!!customerId || includeExpired"
    use-search-drawer
  >
    <template #input>
      <g-input-site v-bind.sync="model" />
    </template>
    <template #search-drawer>
      <v-container>
        <g-autocomplete-customer
          v-model="customerId"
          label="取引先"
          clearable
          hide-details
        />
        <a-switch
          v-model="includeExpired"
          label="終了現場も表示する"
          hide-details
        />
      </v-container>
    </template>
    <template #data-table="{ attrs, on }">
      <g-data-table-sites v-bind="attrs" v-on="on" />
    </template>
  </g-template-index>
</template>

<style></style>
