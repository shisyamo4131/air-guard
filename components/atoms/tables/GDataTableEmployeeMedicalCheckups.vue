<script>
/**
 * 従業員の健康保険ドキュメント用データテーブルコンポーネント
 * - 特定従業員の健康診断ドキュメントを表示するためのコンポーネントです。
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
        { text: '受診日', value: 'dateJp' },
        { text: '受診機関', value: 'agency' },
        { text: '血圧', value: 'bloodPressure' },
        { text: '所見', value: 'hasFindings' },
      ],
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * データテーブルの表示に必要な項目を props.items に追加して返します。
     * - フォーマットした受診日, 血圧を追加します。
     */
    computedItems() {
      // 日付をフォーマットする関数
      const convertToJpDate = (date) => {
        return date ? this.$dayjs(date).format('YYYY年MM月DD日') : ''
      }

      return this.items.map((item) => {
        const dateJp = convertToJpDate(item.date)
        const bloodPressure = `${item.bloodTop} - ${item.bloodBottom}`
        return { ...item, dateJp, bloodPressure }
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
    <template #[`item.hasFindings`]="{ item }">
      <v-icon v-if="!item.hasFindings" color="error">mdi-heart-broken</v-icon>
    </template>
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
