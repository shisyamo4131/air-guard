<script>
/**
 * 現場のDataTableコンポーネントです。
 *
 * @author shisyamo4131
 */
import GChipSyncStatus from '~/components/atoms/chips/GChipSyncStatus.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable, GChipSyncStatus },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    items: { type: Array, default: () => [], required: false },
    sortBy: { type: [String, Array], default: 'code', required: false },
    sortDesc: { type: [Boolean, Array], default: true, required: false },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      const result = []
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          result.push(
            { text: 'CODE', value: 'code', width: 84 },
            { text: '現場名', value: 'abbr', sortable: false },
            { text: '取引先', value: 'customerName', sortable: false },
            {
              text: '同期状態',
              value: 'sync',
              sortable: false,
              align: 'center',
            }
          )
          break
        case 'sm':
          result.push(
            { text: 'CODE', value: 'code', width: 84 },
            {
              text: '現場名/取引先',
              value: 'abbr',
              sortable: false,
            },
            {
              text: '同期状態',
              value: 'sync',
              sortable: false,
              align: 'center',
            }
          )
          break
        default:
          result.push(
            { text: 'CODE', value: 'code', width: 84 },
            { text: '現場名/取引先', value: 'abbr', sortable: false },
            { text: '住所', value: 'address', sortable: false },
            {
              text: '同期状態',
              value: 'sync',
              sortable: false,
              align: 'center',
            }
          )
      }
      return result
    },
    internalItems() {
      return this.items.map((item) => {
        const customer = this.$store.getters['customers/get'](item.customerId)
        return {
          ...item,
          customerName: customer?.abbr || 'N/A',
        }
      })
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * テーブルのトップにスクロールする
     */
    scrollToTop() {
      this.$refs.table.scrollToTop()
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="$attrs"
    ref="table"
    :headers="headers"
    :items="internalItems"
    :mobile-breakpoint="600"
    :sort-by="sortBy"
    :sort-desc="sortDesc"
    v-on="$listeners"
  >
    <template #[`item.abbr`]="{ item }">
      <div class="d-flex align-center">
        <div>
          <v-icon v-if="item.status === 'active'" color="green" left x-small
            >mdi-play</v-icon
          ><v-icon v-else color="red" left x-small>mdi-stop</v-icon>
        </div>
        <div>
          <div>
            {{ item.abbr }}
          </div>
          <div
            v-if="$vuetify.breakpoint.smAndUp"
            class="text-caption grey--text text--darken-1"
          >
            {{ item.customerName }}
          </div>
        </div>
      </div>
    </template>
    <template #[`item.sync`]="{ item }">
      <g-chip-sync-status :value="item.sync" x-small />
    </template>
  </g-data-table>
</template>

<style></style>
