<script>
/**
 * ### GNumeric
 *
 * @author shisyamo4131
 */
import ANumeric from '~/components/atoms/inputs/ANumeric.vue'
import ALabelInput from '~/components/atoms/labels/ALabelInput.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ANumeric, ALabelInput },
}
</script>

<template>
  <a-label-input v-bind="$attrs" v-on="$listeners">
    <template #default="{ attrs, on }">
      <a-numeric v-bind="attrs" v-on="on">
        <template
          v-for="(_, scopedSlotName) in $scopedSlots"
          #[scopedSlotName]="slotData"
        >
          <slot :name="scopedSlotName" v-bind="slotData" />
        </template>
        <template v-for="(_, slotName) in $slots" #[slotName]>
          <slot :name="slotName" />
        </template>
      </a-numeric>
    </template>
  </a-label-input>
</template>
<style></style>
