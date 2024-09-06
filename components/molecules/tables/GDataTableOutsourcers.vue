<script>
/**
 * ### GDataTableOutsourcers
 *
 * 外注先のDataTableコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-08-22 - 初版作成
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
      return [
        { text: 'CODE', value: 'code', width: 84 },
        { text: '外注先名', value: 'name', sortable: false },
        { text: '住所', value: 'address1', sortable: false },
      ]
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
      <div class="d-flex">
        <v-icon v-if="item.status === 'active'" color="green" left small
          >mdi-play</v-icon
        >
        <v-icon v-else color="red" left small>mdi-stop</v-icon>
        <div>{{ item.name }}</div>
      </div>
    </template>
  </g-data-table>
</template>

<style></style>
