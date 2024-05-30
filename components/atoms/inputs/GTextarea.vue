<script>
/**
 * ### GTextarea
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    outlined: { type: Boolean, default: true, required: false },
    requiredError: { type: String, default: '必須入力です', required: false },
  },
}
</script>

<template>
  <air-textarea v-bind="{ ...$props, ...$attrs }" v-on="$listeners">
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
  </air-textarea>
</template>
<style></style>
