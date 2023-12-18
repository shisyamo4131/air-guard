<script>
/**
 * @author shisyamo4131
 */
export default {}
</script>

<template>
  <v-date-picker
    v-bind="$attrs"
    locale="ja-jp"
    :day-format="(date) => new Date(date).getDate()"
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
  </v-date-picker>
</template>

<style></style>
