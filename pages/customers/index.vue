<script>
import { limit, orderBy } from 'firebase/firestore'
import ASwitch from '~/components/atoms/inputs/ASwitch.vue'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GDataTableCustomers from '~/components/molecules/tables/GDataTableCustomers.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
/**
 * ### pages.customers.index
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputCustomer,
    GTemplateIndex,
    ASwitch,
    GDataTableCustomers,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app }) {
    const model = app.$Customer()
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
    label="取引先管理"
    :dialog-props="{ width: 600 }"
    :items="filteredItems"
    :lazy-search.sync="lazySearch"
    :model="model"
  >
    <template #input>
      <g-input-customer v-bind.sync="model" />
    </template>
    <template #append-search>
      <a-switch
        v-model="includeExpired"
        class="ml-2"
        hide-details
        label="契約終了も表示する"
      />
    </template>
    <template #data-table="{ attrs, on }">
      <g-data-table-customers v-bind="attrs" v-on="on" />
    </template>
  </g-template-index>
</template>

<style></style>
