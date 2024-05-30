<script>
/**
 * ### GTextFieldSearch
 * A component for search text input.
 * A lazy-value is updated with delay if the value was updated.
 * This property is useful for querying by the API.
 * note: A lazy-value is updated immediately if the value was null or undefined.
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    clearable: { type: Boolean, default: true, required: false },
    delay: { type: [String, Number], default: 500, required: false },
    dense: { type: Boolean, default: true, required: false },
    flat: { type: Boolean, default: true, required: false },
    hideDetails: { type: Boolean, default: true, required: false },
    lazyValue: { type: undefined, default: undefined, required: false },
    placeholder: { type: String, default: 'SEARCH', required: false },
    prependInnerIcon: { type: String, default: 'mdi-magnify', required: false },
    soloInverted: { type: Boolean, default: true, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      internalValue: null,
      timerId: null,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /* for v-model */
    computedValue: {
      get() {
        return this.internalValue
      },
      set(v) {
        this.internalValue = v
        this.$emit('input', v)
      },
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /* Save the 'value' to 'internalValue' if it specified. */
    '$attrs.value': {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.internalValue = newVal
      },
      immediate: true,
    },
    /* Synchronize to the 'lazyValue' with specified delay when the 'internalValue' is changed. */
    internalValue: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        clearTimeout(this.timerId)
        const delay = newVal ? Number(this.delay) : 0
        this.timerId = setTimeout(() => {
          this.$emit('update:lazyValue', newVal)
        }, delay)
      },
      immediate: true,
    },
  },
}
</script>

<template>
  <air-text-field
    v-bind="{ ...$props, ...$attrs }"
    v-model="computedValue"
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
  </air-text-field>
</template>

<style></style>
