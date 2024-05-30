<script>
import GDataTable from '../../atoms/tables/GDataTable.vue'
/**
 * ### GDataTableAutonumbers
 * 自動採番ドキュメント用のDataTableコンポーネントです。
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
    headers: {
      type: Array,
      default: () => [
        { text: 'コレクション名', value: 'collectionId' },
        { text: '現在値', value: 'current' },
        { text: '桁数', value: 'length' },
        { text: 'フィールド名', value: 'field' },
        { text: '状態', value: 'status' },
      ],
    },
    sortBy: { type: [String, Array], default: 'collectionId', required: false },
  },
}
</script>

<template>
  <g-data-table v-bind="{ ...$props, ...$attrs }" v-on="$listeners" />
</template>

<style></style>
