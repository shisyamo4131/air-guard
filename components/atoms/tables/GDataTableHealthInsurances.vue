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
        { text: '被保険者整理番号', value: 'policyNumber' },
        { text: '資格取得日', value: 'acquisitionDateJp' },
        { text: '資格喪失日', value: 'lossDateJp' },
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
        const acquisitionDateJp = convertToJpDate(item.acquisitionDate)
        const lossDateJp = convertToJpDate(item.lossDate)
        return { ...item, acquisitionDateJp, lossDateJp }
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
