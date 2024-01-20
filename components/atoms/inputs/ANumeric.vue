<script>
/**
 * ### ANumeric
 * A component for number input.
 * @author shisyamo4131
 */
export default {
  props: {
    dense: { type: Boolean, default: true, required: false },
    outlined: { type: Boolean, default: true, required: false },
    requiredError: { type: String, default: '必須入力', required: false },
  },
}
</script>

<template>
  <air-numeric v-bind="{ ...$props, ...$attrs }" v-on="$listeners">
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
  </air-numeric>
</template>

<style></style>
