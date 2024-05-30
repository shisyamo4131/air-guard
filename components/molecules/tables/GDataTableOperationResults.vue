<script>
import GDataTable from '../../atoms/tables/GDataTable.vue'
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
    sortBy: { type: [String, Array], default: 'date', required: false },
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
        { text: '日付', value: 'date' },
        {
          text: '勤務区分',
          value: 'workShift',
          align: 'center',
          sortable: false,
        },
        { text: '現場', value: 'site.abbr', sortable: false },
        { text: '稼働数', value: 'workers', align: 'right', sortable: false },
        { text: '売上', value: 'sales', align: 'right', sortable: false },
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
    <template #[`item.workShift`]="{ item }">
      {{ $WORK_SHIFT[item.workShift] }}
    </template>
    <template #[`item.site.abbr`]="{ item }">
      <div class="text-truncate" style="max-width: 168px">
        {{ item.site.abbr }}
      </div>
      <div class="text-caption grey--text text--darken-1">
        {{ item.site.customer.abbr }}
      </div>
    </template>
    <template #[`item.workers`]="{ item }">
      {{
        `${
          item.workers.standard.normal +
          item.workers.standard.half +
          item.workers.standard.canceled +
          item.workers.qualified.normal +
          item.workers.qualified.half +
          item.workers.qualified.canceled
        } 人工`
      }}
    </template>
    <template #[`item.sales`]="{ item }">
      {{ `${(item.sales || 0).toLocaleString()} 円` }}
    </template>
  </g-data-table>
</template>

<style></style>
