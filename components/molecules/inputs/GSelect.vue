<script>
/**
 * ### GSelect
 *
 * @author shisyamo4131
 */
import ASelect from '~/components/atoms/inputs/ASelect.vue'
import ALabelInput from '~/components/atoms/labels/ALabelInput.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ASelect, ALabelInput },
}
</script>

<template>
  <a-label-input v-bind="$attrs" v-on="$listeners">
    <template #default="{ attrs, on }">
      <a-select v-bind="attrs" v-on="on">
        <template
          v-for="(_, scopedSlotName) in $scopedSlots"
          #[scopedSlotName]="slotData"
        >
          <slot :name="scopedSlotName" v-bind="slotData" />
        </template>
        <template v-for="(_, slotName) in $slots" #[slotName]>
          <slot :name="slotName" />
        </template>
      </a-select>
    </template>
  </a-label-input>
</template>
<style></style>
