<script>
/**
 * ### GTextFieldSearch
 * A component for search text input.
 * A lazy-value is updated with delay if the value was updated.
 * This property is useful for querying by the API.
 * note: A lazy-value is updated immediately if the value was null or undefined.
 * @author shisyamo4131
 * @create 2024-01-17
 */
import ATextFieldSearch from '~/components/atoms/inputs/ATextFieldSearch.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ATextFieldSearch },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    delay: { type: [String, Number], default: 500, required: false },
    lazyValue: { type: undefined, default: undefined, required: false },
    value: { type: undefined, default: undefined, required: false },
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
  computed: {},
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    value: {
      handler(v) {
        clearTimeout(this.timerId)
        const delay = v ? Number(this.delay) : 0
        this.timerId = setTimeout(() => {
          this.$emit('update:lazyValue', v)
        }, delay)
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {},
}
</script>

<template>
  <a-text-field-search v-bind="$attrs" :value="value" v-on="$listeners">
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
  </a-text-field-search>
</template>

<style></style>
