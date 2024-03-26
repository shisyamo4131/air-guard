<script>
/**
 * ### GTextField
 *
 * @author shisyamo4131
 */
import ATextField from '~/components/atoms/inputs/ATextField.vue'
import ALabelInput from '~/components/atoms/labels/ALabelInput.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ATextField, ALabelInput },
}
</script>

<template>
  <a-label-input v-bind="$attrs" v-on="$listeners">
    <template #default="{ attrs, on }">
      <a-text-field v-bind="attrs" v-on="on">
        <template
          v-for="(_, scopedSlotName) in $scopedSlots"
          #[scopedSlotName]="slotData"
        >
          <slot :name="scopedSlotName" v-bind="slotData" />
        </template>
        <template v-for="(_, slotName) in $slots" #[slotName]>
          <slot :name="slotName" />
        </template>
      </a-text-field>
    </template>
  </a-label-input>
</template>
<style></style>
