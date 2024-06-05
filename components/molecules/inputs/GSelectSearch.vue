<script>
/**
 * ### GSelectSearch
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    clearable: { type: Boolean, default: true, required: false },
    dense: { type: Boolean, default: true, required: false },
    flat: { type: Boolean, default: true, required: false },
    hideDetails: { type: Boolean, default: true, required: false },
    menuProps: {
      type: Object,
      default: () => ({ offsetY: true }),
      required: false,
    },
    placeholder: { type: String, default: 'SEARCH', required: false },
    prependInnerIcon: { type: String, default: 'mdi-magnify', required: false },
    soloInverted: { type: Boolean, default: true, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {}
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {},
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},
}
</script>

<template>
  <air-select v-bind="{ ...$props, ...$attrs }" v-on="$listeners">
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
  </air-select>
</template>

<style></style>
