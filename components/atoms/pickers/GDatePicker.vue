<script>
/**
 * Vuetifyの VDatePicker を拡張したカスタム日付ピッカーコンポーネントです。
 * @author shisyamo4131
 * @refact 2025-01-15
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    locale: { type: String, default: 'ja-jp', required: false },
    dayFormat: {
      type: Function,
      default: (date) => new Date(date).getDate(),
      required: false,
    },
    firstDayOfWeek: { type: String, default: '1', required: false },
  },
}
</script>

<template>
  <v-date-picker v-bind="{ ...$props, ...$attrs }" v-on="$listeners">
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
  </v-date-picker>
</template>

<style></style>
