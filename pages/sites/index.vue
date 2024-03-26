<script>
import { limit, orderBy, where } from 'firebase/firestore'
import GDataTableSites from '~/components/molecules/tables/GDataTableSites.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import AIconRegist from '~/components/atoms/icons/AIconRegist.vue'
/**
 * ### pages.sites.index
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SitesIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTableSites,
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
      model: this.$Site(),
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
  <g-template-default label="現場管理">
    <template #append-toolbar>
      <a-icon-regist @click="$router.push(`sites/regist`)" />
    </template>
    <template #default="{ height }">
      <g-data-table-sites
        :height="height"
        :items="items"
        :lazy-search.sync="lazySearch"
        show-actions
        @click:detail="$router.push(`sites/${$event.docId}`)"
      />
    </template>
  </g-template-default>
</template>

<style></style>
