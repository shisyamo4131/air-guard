<script>
import { limit, orderBy } from 'firebase/firestore'
import ASwitch from '~/components/atoms/inputs/ASwitch.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GDataTableSites from '~/components/molecules/tables/GDataTableSites.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
/**
 * ### pages.sites.index
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputSite,
    GTemplateIndex,
    ASwitch,
    GDataTableSites,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      defaultConstraints: [orderBy('updateAt', 'desc'), limit(10)],
      includeExpired: false,
      items: [],
      lazySearch: null,
      loading: false,
      model: this.$Site(),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    filteredItems() {
      return this.items.filter((item) => {
        if (this.includeExpired) return true
        return item.status === 'active'
      })
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    lazySearch: {
      async handler(v) {
        this.loading = true
        await this.fetchDocs()
        this.loading = false
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async fetchDocs() {
      const ngram = this.lazySearch || undefined
      const constraints = this.lazySearch ? [] : this.defaultConstraints
      this.items = await this.model.fetchDocs(ngram, constraints)
    },
  },
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
  >
    <template #input>
      <g-input-site v-bind.sync="model" />
    </template>
    <template #append-search>
      <a-switch
        v-model="includeExpired"
        class="ml-2"
        hide-details
        label="終了現場も表示する"
      />
    </template>
    <template #data-table="{ attrs, on }">
      <g-data-table-sites v-bind="attrs" v-on="on" />
    </template>
  </g-template-index>
</template>

<style></style>
