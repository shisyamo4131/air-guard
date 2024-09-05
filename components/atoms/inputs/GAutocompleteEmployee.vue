<script>
import GAutocomplete from './GAutocomplete.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GAutocomplete },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      itemText: 'fullName',
    }
  },
}
</script>

<template>
  <g-autocomplete
    v-bind="$attrs"
    :item-text="itemText"
    item-value="docId"
    :items="$store.state.employees.items"
    v-on="$listeners"
  >
  </g-autocomplete>
</template>

<style></style>
