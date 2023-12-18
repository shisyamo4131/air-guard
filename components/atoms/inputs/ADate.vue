<script>
/**
 * @author shisyamo4131
 */
export default {}
</script>

<template>
  <air-date v-bind="$attrs" dense outlined v-on="$listeners">
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
  </air-date>
</template>

<style></style>
