<script>
import GDataTable from './GDataTable.vue'
/**
 * ## GDataTableSites
 * Sites用DataTableコンポーネント
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
      if (this.$vuetify.breakpoint.smAndDown) {
        return [{ text: '現場名', value: 'abbr' }]
      }
      return [
        { text: 'CODE', value: 'code' },
        { text: '現場名', value: 'name' },
        { text: '住所', value: 'address' },
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
    <template #[`item.name`]="{ item }">
      <div>{{ item.name }}</div>
      <div class="text-caption grey--text text--darken-1">
        {{ item?.customer?.abbr || 'loading' }}
      </div>
    </template>
    <template #[`item.abbr`]="{ item }">
      <div>{{ item.abbr }}</div>
      <div class="text-caption grey--text text--darken-1">
        {{ item?.customer?.abbr || 'loading' }}
      </div>
    </template>
    <template #[`item.status`]="{ item }">
      {{ $SITE_STATUS[item.status] }}
    </template>
  </g-data-table>
</template>

<style></style>
