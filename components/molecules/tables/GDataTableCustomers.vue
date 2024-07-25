<script>
/**
 * ### GDataTableCustomers
 *
 * 取引先のDataTableコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.1.0
 *
 * @updates
 * - version 1.1.0 - 2024-07-25 - 契約中かどうかを表すアイコンを取引先名の左に追加。
 * - version 1.0.0 - 2024-06-25 - 初版作成
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
          { text: '取引先名', value: 'name1', sortable: false },
          { text: '住所', value: 'address1', sortable: false },
          { text: 'TEL/FAX', value: 'tel', sortable: false },
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
  </g-data-table>
</template>

<style></style>
