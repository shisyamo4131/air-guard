<script>
import { limit, orderBy } from 'firebase/firestore'
import GInputOperationResult from '~/components/molecules/inputs/GInputOperationResult.vue'
import GDataTableOperationResults from '~/components/molecules/tables/GDataTableOperationResults.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
/**
 * ### pages.operation-results.index
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputOperationResult,
    GTemplateIndex,
    GDataTableOperationResults,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      defaultConstraints: [orderBy('updateAt', 'desc'), limit(10)],
      items: [],
      lazySearch: null,
      loading: false,
      model: this.$OperationResult(),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    filteredItems() {
      return this.items.filter((item) => {
        return true
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
    label="稼働実績管理"
    :items="filteredItems"
    :lazy-search.sync="lazySearch"
    :loading="loading"
    :model="model"
    regist-at-page
  >
    <template #input="{ attrs, on }">
      <g-input-operation-result v-bind="attrs" v-on="on" />
    </template>
    <!-- <template #search-drawer>
      <v-container>
        <a-switch
          v-model="includeExpired"
          class="ml-2"
          hide-details
          label="契約終了も表示する"
        />
      </v-container>
    </template> -->
    <template #data-table="{ attrs, on }">
      <g-data-table-operation-results v-bind="attrs" v-on="on" />
    </template>
  </g-template-index>
</template>

<style></style>
