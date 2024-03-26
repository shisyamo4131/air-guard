<script>
/**
 * ### GTextarea
 *
 * @author shisyamo4131
 */
import ATextarea from '~/components/atoms/inputs/ATextarea.vue'
import ALabelInput from '~/components/atoms/labels/ALabelInput.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ATextarea, ALabelInput },
}
</script>

<template>
  <a-label-input v-bind="$attrs" v-on="$listeners">
    <template #default="{ attrs, on }">
      <a-textarea v-bind="attrs" v-on="on">
        <template
          v-for="(_, scopedSlotName) in $scopedSlots"
          #[scopedSlotName]="slotData"
        >
          <slot :name="scopedSlotName" v-bind="slotData" />
        </template>
        <template v-for="(_, slotName) in $slots" #[slotName]>
          <slot :name="slotName" />
        </template>
      </a-textarea>
    </template>
  </a-label-input>
</template>
<style></style>
