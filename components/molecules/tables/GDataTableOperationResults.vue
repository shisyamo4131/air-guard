<script>
import GDataTable from './GDataTable.vue'
/**
 * ## GDataTableOperationResult
 * OperationResult用DataTableコンポーネント
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
        return [
          { text: '日付', value: 'date' },
          { text: '現場', value: 'site.abbr' },
        ]
      }
      return [
        { text: 'CODE', value: 'code' },
        { text: '日付', value: 'date' },
        { text: '現場', value: 'site.abbr' },
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
    <template #[`item.date`]="{ item }">
      {{ `${$dayjs(item.date).format('DD日(ddd)')}` }}
    </template>
    <template #[`item.site.abbr`]="{ item }">
      <div>{{ item.site.abbr }}</div>
      <div class="text-caption grey--text text--darken-1">
        {{ item.site.customer.abbr }}
      </div>
    </template>
  </g-data-table>
</template>

<style></style>
