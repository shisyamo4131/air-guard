<script>
/**
 * @author shisyamo4131
 */
export default {}
</script>

<template>
  <air-text-field
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
  </air-text-field>
</template>

<style></style>
