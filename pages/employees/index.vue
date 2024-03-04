<script>
import { limit, orderBy, where } from 'firebase/firestore'
import ASwitch from '~/components/atoms/inputs/ASwitch.vue'
import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
import GDataTableEmployees from '~/components/molecules/tables/GDataTableEmployees.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
/**
 * ### pages.employees.index
 * @author shisyamo4131
 */
export default {
  name: 'EmployeesIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputEmployee,
    GTemplateIndex,
    ASwitch,
    GDataTableEmployees,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      defaultConstraints: [
        where('status', '==', 'active'),
        orderBy('updateAt', 'desc'),
        limit(10),
      ],
      includeExpired: false,
      items: [],
      lazySearch: null,
      loading: false,
      model: this.$Employee(),
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
    label="従業員管理"
    :items="filteredItems"
    :lazy-search.sync="lazySearch"
    :loading="loading"
    :model="model"
    regist-at-page
    :search-drawer-badge="includeExpired"
    use-search-drawer
  >
    <template #input="{ attrs, on }">
      <g-input-employee v-bind="attrs" v-on="on" />
    </template>
    <template #search-drawer>
      <v-container>
        <a-switch
          v-model="includeExpired"
          class="ml-2"
          hide-details
          label="契約終了も表示する"
        />
      </v-container>
    </template>
    <template #data-table="{ attrs, on }">
      <g-data-table-employees v-bind="attrs" v-on="on" />
    </template>
  </g-template-index>
</template>

<style></style>
