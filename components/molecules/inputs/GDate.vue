<script>
/**
 * ### GDate
 *
 * @author shisyamo4131
 */
import ADate from '~/components/atoms/inputs/ADate.vue'
import ALabelInput from '~/components/atoms/labels/ALabelInput.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ADate, ALabelInput },
}
</script>

<template>
  <a-label-input v-bind="$attrs" v-on="$listeners">
    <template #default="{ attrs, on }">
      <a-date v-bind="attrs" v-on="on">
        <template
          v-for="(_, scopedSlotName) in $scopedSlots"
          #[scopedSlotName]="slotData"
        >
          <slot :name="scopedSlotName" v-bind="slotData" />
        </template>
        <template v-for="(_, slotName) in $slots" #[slotName]>
          <slot :name="slotName" />
        </template>
      </a-date>
    </template>
  </a-label-input>
</template>
<style></style>
