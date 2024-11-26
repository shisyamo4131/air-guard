<script>
/**
 * 従業員選択用のAutocompleteコンポーネントです。
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
    label: { type: String, default: '従業員', required: false },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.getters['employees/items']
    },
  },
}
</script>

<template>
  <g-autocomplete
    v-bind="$attrs"
    item-text="fullName"
    item-value="docId"
    :items="items"
    :label="label"
    :multiple="false"
    v-on="$listeners"
  >
  </g-autocomplete>
</template>

<style></style>
