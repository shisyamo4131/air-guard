<script>
/**
 * 健康保険ドキュメント用データテーブルコンポーネント
 * @author shisyamo4131
 */
import GDataTable from './GDataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    items: { type: Array, default: () => [], required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      headers: [
        { text: 'CODE', value: 'employee.code' },
        { text: '従業員', value: 'employee.fullName' },
        { text: '受診日', value: 'dateJp' },
        { text: '受診機関', value: 'agency' },
      ],
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * データテーブルの表示に必要な項目を props.items に追加して返します。
     * - フォーマットした資格取得日, 資格喪失日を追加します。
     */
    computedItems() {
      // 日付をフォーマットする関数
      const convertToJpDate = (date) => {
        return date ? this.$dayjs(date).format('YYYY年MM月DD日') : ''
      }

      // props.items にフォーマットした資格取得日, 資格喪失日を追加
      return this.items.map((item) => {
        const dateJp = convertToJpDate(item.date)
        return { ...item, dateJp }
      })
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="$attrs"
    :headers="headers"
    :items="computedItems"
    v-on="$listeners"
  >
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
