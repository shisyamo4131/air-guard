<script>
import GChipSyncStatus from '~/components/atoms/chips/GChipSyncStatus.vue'
/**
 * 取引先のDataTableコンポーネントです。
 *
 * @author shisyamo4131
 */
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable, GChipSyncStatus },
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
            { text: '取引先名', value: 'abbr', cellClass: 'truncate-cell' },
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
            { text: '取引先名', value: 'abbr', cellClass: 'truncate-cell' },
            {
              text: '同期状態',
              value: 'sync',
              sortable: false,
              align: 'center',
            }
          )
          break
        case 'md':
          result.push(
            { text: 'CODE', value: 'code', width: 84 },
            { text: '取引先名', value: 'abbr', cellClass: 'truncate-cell' },
            { text: '住所', value: 'address1', sortable: false },
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
            { text: '取引先名', value: 'abbr', sortable: false },
            { text: '住所', value: 'address1', sortable: false },
            { text: 'TEL/FAX', value: 'tel', sortable: false },
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
  },
}
</script>

<template>
  <g-data-table
    v-bind="$attrs"
    :headers="headers"
    :mobile-breakpoint="600"
    v-on="$listeners"
  >
    <template #[`item.name1`]="{ item }">
      <div class="d-flex">
        <v-icon v-if="item.status === 'active'" color="green" left small
          >mdi-play</v-icon
        >
        <v-icon v-else color="red" left small>mdi-stop</v-icon>
        <div>
          <div>{{ item.name1 }}</div>
          <div v-if="item.name2" class="text-caption grey--text text--darken-1">
            {{ item.name2 }}
          </div>
        </div>
      </div>
    </template>
    <template #[`item.tel`]="{ item }">
      <div><v-icon left x-small>mdi-phone</v-icon>{{ item.tel }}</div>
      <div><v-icon left x-small>mdi-fax</v-icon>{{ item.fax }}</div>
    </template>
    <template #[`item.sync`]="{ item }">
      <g-chip-sync-status :value="item.sync" x-small />
    </template>
  </g-data-table>
</template>

<style></style>
