<script>
/**
 * 年を選択するコンポーネントです。
 * yearSpan を指定することで選択可能な年を調整可能です。
 * @author shisyamo4131
 */
import GSelect from './GSelect.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GSelect },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    value: {
      type: String,
      default: null,
      required: false, // 必須ではない
    },
    label: {
      type: String,
      default: '年を選択してください',
      required: false,
    },
    yearSpan: {
      type: Number,
      default: 3, // 年の幅（前後の年数）
      validator: (value) => value > 0,
      required: false,
    },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    yearRange() {
      const currentYear = this.$dayjs().year()

      // 範囲内の年を生成
      const start = currentYear - this.yearSpan
      const end = currentYear + this.yearSpan

      return Array.from({ length: end - start + 1 }, (_, i) => {
        const year = start + i
        return { text: `${year}年`, value: String(year) }
      })
    },
  },
}
</script>

<template>
  <g-select
    v-bind="$attrs"
    :items="yearRange"
    :label="label"
    :value="value"
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
  </g-select>
</template>

<style></style>
