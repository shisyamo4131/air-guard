<script>
import GAutocompleteFirestore from './GAutocompleteFirestore.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GAutocompleteFirestore },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      itemText: 'abbr',
      model: this.$Customer(),
    }
  },
}
</script>

<template>
  <g-autocomplete-firestore
    v-bind="$attrs"
    :item-text="itemText"
    :model="model"
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
  </g-autocomplete-firestore>
</template>

<style></style>
