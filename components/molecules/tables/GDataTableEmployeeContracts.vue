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
 *                              - 現在有効な雇用契約について、契約日の前にアイコンを表示。
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
    items: { type: Array, default: () => [], required: false },
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
            { text: '就業規則', value: 'workRegulation', sortable: false },
          ]
        default:
          return [
            { text: '契約日', value: 'startDate' },
            { text: '就業規則', value: 'workRegulation', sortable: false },
            {
              text: '基本給',
              value: 'basicWage',
              align: 'right',
              sortable: false,
            },
          ]
      }
    },
    computedItems() {
      // 配列を複製して日付の降順にソート
      const sorted = this.items
        .slice()
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))

      // 現在日付以下のデータの最初の1件を取得
      const currentItem = sorted.find(
        ({ startDate }) => new Date(startDate) <= new Date()
      )

      // すべてのアイテムに対して isCurrent をセット
      return sorted.map((item) => {
        return {
          ...item,
          isCurrent: item === currentItem, // currentItem の場合だけ true
        }
      })
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="{ ...$props, ...$attrs, headers: inHeaders }"
    :items="computedItems"
    :mobile-breakpoint="0"
    v-on="$listeners"
  >
    <!-- `startDate` -->
    <template #[`item.startDate`]="{ item }">
      <v-icon v-if="item.isCurrent" color="green" left small>mdi-play</v-icon>
      {{ item.startDate }}
    </template>

    <!-- `workRegulation` -->
    <template #[`item.workRegulation`]="{ item }">
      {{ item.workRegulation.name }}
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
