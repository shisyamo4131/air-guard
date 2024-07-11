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
      itemText: ['abbr', 'address1'],
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
    <template #selection="{ item }">
      <v-chip color="primary" label small>
        {{ `[${item.code}] ${item.abbr}` }}
      </v-chip>
    </template>
    <template #item="{ item }">
      <v-list-item-icon>
        <v-icon v-if="item.status === 'active'" color="green" small
          >mdi-play</v-icon
        >
        <v-icon v-else color="red" small>mdi-stop</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>{{ item.name1 }}</v-list-item-title>
        <v-list-item-subtitle>{{ item.name2 }}</v-list-item-subtitle>
      </v-list-item-content>
    </template>
  </g-autocomplete-firestore>
</template>

<style></style>
