<script>
/**
 * ## GDataTableEmployeeContracts
 *
 * 従業員の雇用契約情報を表示するDataTableコンポーネントです。
 *
 * @author shisyamo4131
 * @version 2.0.0
 *
 * @updates
 * - version 2.0.0 - 2024-07-24 - 雇用契約情報の編集機能を排除 -> 純粋なDataTableコンポーネントとして再実装
 * - version 1.0.0 - 2024-07-18 - 初版作成
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
    /**
     * DataTableに表示されるitemsの表示順です。規定値は`startDate`です。
     */
    sortBy: { type: [String, Array], default: 'startDate', required: false },
    /**
     * trueにするとitemsがsortByで指定された項目の降順になります。規定値はtrueです。
     */
    sortDesc: { type: [Boolean, Array], default: true, required: false },
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
          return [{ text: '契約日', value: 'startDate' }]
        case 'sm':
          return [
            { text: '契約日', value: 'startDate' },
            { text: '雇用形態', value: 'contractType', sortable: false },
          ]
        default:
          return [
            { text: '契約日', value: 'startDate' },
            { text: '雇用形態', value: 'contractType', sortable: false },
            {
              text: '基本給',
              value: 'basicWage',
              align: 'right',
              sortable: false,
            },
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
    <!-- `contractType` -->
    <template #[`item.contractType`]="{ item }">
      {{ $EMPLOYEE_CONTRACT_TYPE[item.contractType] }}
    </template>

    <!-- `basicWage` -->
    <template #[`item.basicWage`]="{ item }">
      {{
        `${item.basicWage.toLocaleString()} 円/${
          item.paymentType === 'monthly' ? '月' : '日'
        }`
      }}
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
