<script>
/**
 * ## GDataTableUsers
 *
 * Users コレクションドキュメント用 DataTable コンポーネントです。
 *
 * @author shisyamo4131
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
      return [
        { text: '表示名', value: 'displayName' },
        { text: 'email', value: 'email' },
        { text: 'uid', value: 'docId' },
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
  </g-data-table>
</template>

<style></style>
