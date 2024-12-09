<script>
/**
 * OperationResult用DataTableコンポーネント
 * @author shisyamo4131
 */
import ja from 'dayjs/locale/ja'
import GDataTable from '../../atoms/tables/GDataTable.vue'
import GChipWorkShift from '~/components/atoms/chips/GChipWorkShift.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable, GChipWorkShift },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    items: { type: Array, default: () => [], required: false },
    sortBy: { type: [String, Array], default: 'date', required: false },
    sortDesc: { type: [Boolean, Array], default: true, required: false },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      const result = [
        { text: '日付', value: 'dayJp', width: 108 },
        {
          text: '曜日区分',
          value: 'dayDiv',
          width: 96,
          align: 'center',
          sortable: false,
        },
        {
          text: '勤務区分',
          value: 'workShift',
          width: 96,
          align: 'center',
          sortable: false,
        },
        { text: '現場', value: 'site.abbr', sortable: false },
      ]
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          break
        case 'sm':
          break
        case 'md':
          result.push({
            text: '稼働数',
            value: 'operationCount',
            align: 'right',
            sortable: false,
          })
          break
        default:
          result.push({
            text: '稼働数',
            value: 'operationCount',
            align: 'right',
            sortable: false,
          })
      }
      return result
    },

    internalItems() {
      return this.items.map((item) => {
        const dayJp = this.$dayjs(item.date).locale(ja).format('DD日（ddd）')
        return { ...item, dayJp }
      })
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="{ ...$props, ...$attrs }"
    :headers="headers"
    :items="internalItems"
    v-on="$listeners"
  >
    <template #[`item.dayDiv`]="{ item }">
      {{ $DAY_DIV[item.dayDiv] }}
    </template>
    <template #[`item.workShift`]="{ item }">
      <g-chip-work-shift x-small :value="item.workShift" />
    </template>
    <template #[`item.site.abbr`]="{ item }">
      <div>
        <v-icon v-if="item.isLocked" color="info" left small>mdi-lock</v-icon
        >{{ item.site.abbr }}
      </div>
      <div class="text-caption grey--text text--darken-1">
        {{ item.site.customer.abbr }}
      </div>
    </template>
    <template #[`item.operationCount`]="{ item }">
      {{ `${(item.operationCount.total || 0).toLocaleString()} 稼働` }}
    </template>
  </g-data-table>
</template>

<style></style>
