<script>
/**
 * 従業員支給手当情報を表示するDataTableコンポーネントです。
 * @author shisyamo4131
 */
import GDataTable from '../../atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * DataTableに表示する列の定義です。指定しない場合、コンポーネント既定の列が表示されます。
     */
    headers: { type: Array, default: () => [], required: false },
    items: { type: Array, default: () => [], required: false },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * コンポーネント既定のheadersです。
     * - `breakpoint`に応じて表示するカラムを変更します。
     * - `props.headers`が指定されている場合は`props.headers`をそのまま返します。
     */
    inHeaders() {
      if (this.headers.length) return this.headers
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return [
            { text: '手当名', value: 'docId' },
            { text: '金額', value: 'amount' },
          ]
        case 'sm':
          return [
            { text: '手当名', value: 'docId' },
            { text: '金額', value: 'amount' },
          ]
        default:
          return [
            { text: '手当名', value: 'docId' },
            { text: '金額', value: 'amount' },
          ]
      }
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="{ ...$props, ...$attrs, headers: inHeaders }"
    :mobile-breakpoint="0"
    v-on="$listeners"
  >
    <template #[`item.docId`]="{ item }">
      {{ $store.getters['allowances/get'](item.docId)?.name || 'N/A' }}
    </template>

    <!-- other slots -->
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
  </g-data-table>
</template>

<style></style>
