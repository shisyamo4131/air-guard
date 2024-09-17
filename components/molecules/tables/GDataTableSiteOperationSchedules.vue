<script>
/**
 * ### GDataTableSiteOperationSchedules
 *
 * 現場稼働予定のDataTableコンポーネントです。
 *
 * - 現場の稼働予定は基本的にカレンダー表示になるはずなので、多分このコンポーネントは不要になります。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-16 - 初版作成
 */
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {},
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {}
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      return [{ text: 'docId', value: 'docId' }]
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
  </g-data-table>
</template>

<style></style>
