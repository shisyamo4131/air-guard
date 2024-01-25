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
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app }) {
    const model = app.$Site()
    const defaultConstraints = [orderBy('updateAt', 'desc'), limit(10)]
    const items = model.subscribe(undefined, defaultConstraints)
    return { model, items, defaultConstraints }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      includeExpired: false,
      lazySearch: null,
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
    lazySearch(v) {
      this.model.unsubscribe()
      if (v) {
        this.model.subscribe(v)
      } else {
        this.model.subscribe(undefined, [this.defaultConstraints])
      }
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.model.unsubscribe()
  },
}
</script>

<template>
  <g-template-index
    label="現場管理"
    :dialog-props="{ width: 600 }"
    :items="filteredItems"
    :lazy-search.sync="lazySearch"
    :model="model"
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
