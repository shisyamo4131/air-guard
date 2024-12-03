<script>
/**
 * 支給形態 Autocomplete コンポーネント
 * @author shisyamo4131
 */
import GAutocomplete from './GAutocomplete.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GAutocomplete },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, default: '支給形態', required: false },
  },
}
</script>

<template>
  <g-autocomplete
    v-bind="$attrs"
    auto-select-first
    :items="$PAYMENT_TYPE_ARRAY"
    :label="label"
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
  </g-autocomplete>
</template>

<style></style>
