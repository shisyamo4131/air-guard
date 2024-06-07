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
      model: this.$Site(),
      onlyActive: true,
    }
  },
}
</script>

<template>
  <g-autocomplete-firestore
    v-bind="$attrs"
    :filter="(item) => !onlyActive || item.status === 'active'"
    :item-text="itemText"
    :model="model"
    v-on="$listeners"
  >
    <template #prepend-item>
      <v-list-item>
        <v-list-item-action>
          <v-simple-checkbox v-model="onlyActive" />
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title> 稼働中のみ </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider class="mt-2" />
    </template>
    <template #item="{ item }">
      <v-list-item-content>
        <v-list-item-title>
          {{ item.abbr }}
          <v-chip v-if="item.status !== 'active'" x-small>
            {{ $SITE_STATUS[item.status] }}
          </v-chip>
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ item.address }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </template>
  </g-autocomplete-firestore>
</template>

<style></style>
