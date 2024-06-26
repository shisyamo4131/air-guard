<script>
/**
 * ### GDataTableSites
 *
 * 現場のDataTableコンポーネントです。
 *
 * @version 1.0.0
 * @create 2024-06-26
 * @author shisyamo4131
 */
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      const isMobile = this.$vuetify.breakpoint.mobile
      if (!isMobile) {
        return [
          { text: 'CODE', value: 'code', width: 84 },
          { text: '現場名', value: 'name', sortable: false },
          { text: '住所', value: 'address', sortable: false },
        ]
      } else {
        return [
          { text: 'CODE', value: 'code', width: 84 },
          { text: '略称', value: 'abbr', cellClass: 'truncate-cell' },
        ]
      }
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="$attrs"
    :headers="headers"
    :mobile-breakpoint="0"
    v-on="$listeners"
  >
    <template #[`item.name`]="{ item }">
      <div>{{ item.name }}</div>
      <div class="text-caption grey--text text--darken-1">
        {{ item.customer.abbr }}
      </div>
    </template>
  </g-data-table>
</template>

<style></style>
