<script>
import { limit, orderBy, where } from 'firebase/firestore'
import GDataTableCustomers from '~/components/molecules/tables/GDataTableCustomers.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import AIconRegist from '~/components/atoms/icons/AIconRegist.vue'
/**
 * ### pages.customers.index
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'CustomersIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTableCustomers,
    GTemplateDefault,
    AIconRegist,
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
      items: [],
      lazySearch: undefined,
      model: this.$Customer(),
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    lazySearch: {
      handler(v) {
        if (v) {
          this.items = this.model.subscribe(v)
        } else {
          this.items = this.model.subscribe(undefined, this.defaultConstraints)
        }
      },
      immediate: true,
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
  <g-template-default label="取引先管理">
    <template #append-toolbar>
      <a-icon-regist @click="$router.push(`customers/regist`)" />
    </template>
    <template #default="{ height }">
      <g-data-table-customers
        :height="height"
        :items="items"
        :lazy-search.sync="lazySearch"
        show-actions
        @click:detail="$router.push(`customers/${$event.docId}`)"
      />
    </template>
  </g-template-default>
</template>

<style></style>
