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
      itemText: 'abbr',
    }
  },
}
</script>

<template>
  <g-autocomplete
    v-bind="$attrs"
    :item-text="itemText"
    item-value="docId"
    :items="$store.state.sites.items"
    v-on="$listeners"
  >
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
  </g-autocomplete>
</template>

<style></style>
