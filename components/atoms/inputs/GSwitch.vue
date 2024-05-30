<script>
/**
 * ### GSwitch
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * MODEL
   ***************************************************************************/
  model: { prop: 'input-value', event: 'change' },
}
</script>

<template>
  <v-switch
    class="mt-0 pt-2"
    style="height: 66px"
    v-bind="$attrs"
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
  </v-switch>
</template>
<style></style>
