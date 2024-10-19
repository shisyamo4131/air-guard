<script>
/**
 * ## GAutocompleteSite
 *
 * 現場選択用のAutocompleteコンポーネントです。
 * - items には Vuex の sites が読み込まれます。
 *
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
    itemText: { type: String, default: 'abbr' },
    itemValue: { type: String, default: 'docId' },
    label: { type: String, default: '現場' },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.getters['sites/items']
    },
    status() {
      return this.$SITE_STATUS || {}
    },
  },
}
</script>

<template>
  <g-autocomplete
    v-bind="{ ...$props, ...$attrs }"
    :items="items"
    v-on="$listeners"
  >
    <template #item="{ item }">
      <v-list-item-content>
        <v-list-item-title>
          {{ item.abbr }}
          <v-chip v-if="item.status !== 'active'" x-small>
            {{ status[item.status] }}
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
