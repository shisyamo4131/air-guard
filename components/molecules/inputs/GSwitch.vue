<script>
import ASwitch from '~/components/atoms/inputs/ASwitch.vue'
import ALabelInput from '~/components/atoms/labels/ALabelInput.vue'
/**
 * ### GSwitch
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ASwitch, ALabelInput },
  /***************************************************************************
   * MODEL
   ***************************************************************************/
  model: { prop: 'input-value', event: 'change' },
}
</script>

<template>
  <a-label-input v-bind="$attrs" v-on="$listeners">
    <template #default="{ attrs, on }">
      <a-switch class="mt-0 pt-2" style="height: 66px" v-bind="attrs" v-on="on">
        <template
          v-for="(_, scopedSlotName) in $scopedSlots"
          #[scopedSlotName]="slotData"
        >
          <slot :name="scopedSlotName" v-bind="slotData" />
        </template>
        <template v-for="(_, slotName) in $slots" #[slotName]>
          <slot :name="slotName" />
        </template>
      </a-switch>
    </template>
  </a-label-input>
</template>
<style></style>
