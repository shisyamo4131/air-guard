<script>
/**
 * ## GAutocomplete
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    delay: { type: Number, default: 500, required: false },
    dense: { type: Boolean, default: true, required: false },
    outlined: { type: Boolean, default: true, required: false },
    requiredError: { type: String, default: '必須入力', required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      timerId: null,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    listeners() {
      return {
        ...this.$listeners,
        'update:search-input': ($event) => {
          this.$emit('update:search-input', $event)
          clearTimeout(this.timerId)
          this.timerId = setTimeout(() => {
            this.$emit('update:lazy-search', $event)
          }, this.delay)
        },
      }
    },
  },
}
</script>

<template>
  <air-autocomplete v-bind="{ ...$props, ...$attrs }" v-on="listeners">
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
  </air-autocomplete>
</template>

<style></style>
