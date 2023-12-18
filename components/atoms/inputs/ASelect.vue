<script>
/**
 * @author shisyamo4131
 */
export default {}
</script>

<template>
  <air-select
    v-bind="$attrs"
    dense
    outlined
    :menu-props="{ 'offset-y': true }"
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
  </air-select>
</template>

<style></style>
