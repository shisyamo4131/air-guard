<script>
/**
 * ### GAutocompleteCustomer
 * @author shisyamo4131
 */
import AAutocomplete from '~/components/atoms/inputs/AAutocomplete.vue'
export default {
  /*******************************************************
   * COMPONENTS
   *******************************************************/
  components: { AAutocomplete },
  /*******************************************************
   * PROPS
   *******************************************************/
  props: {
    autoSelectFirst: { type: Boolean, default: true, required: false },
    itemText: {
      type: [String, Array, Function],
      default: () => (item) => {
        return `${item.code}: ${item.abbr}`
      },
      required: false,
    },
    itemValue: {
      type: [String, Array, Function],
      default: 'docId',
      required: false,
    },
  },
}
</script>

<template>
  <a-autocomplete v-bind="{ ...$props, ...$attrs }" v-on="$listeners" />
</template>

<style></style>
