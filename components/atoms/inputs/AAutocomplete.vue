<script>
/**
 * @author shisyamo4131
 */
export default {}
</script>

<template>
  <air-autocomplete
    v-bind="$attrs"
    dense
    outlined
    required-error="必須入力"
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
  </air-autocomplete>
</template>

<style></style>
