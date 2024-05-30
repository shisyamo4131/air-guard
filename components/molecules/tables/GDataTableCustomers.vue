<script>
import GDataTable from '../../atoms/tables/GDataTable.vue'
/**
 * ## GDataTableCustomers
 * Customers用DataTableコンポーネント
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    sortBy: { type: [String, Array], default: 'code', required: false },
    sortDesc: { type: [Boolean, Array], default: true, required: false },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      if (this.$vuetify.breakpoint.xs) {
        return [{ text: '取引先名', value: 'abbr' }]
      }
      return [
        { text: 'CODE', value: 'code' },
        { text: '取引先名1', value: 'name1' },
        { text: '取引先名2', value: 'name2' },
        { text: '状態', value: 'status', sortable: false },
      ]
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="{ ...$props, ...$attrs }"
    :headers="headers"
    :mobile-breakpoint="0"
    v-on="$listeners"
  >
    <template #[`item.status`]="{ item }">
      {{ $CUSTOMER_STATUS[item.status] }}
    </template>
  </g-data-table>
</template>

<style></style>
