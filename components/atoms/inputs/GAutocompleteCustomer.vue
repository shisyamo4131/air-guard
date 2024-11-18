<script>
/**
 * 取引先選択用のAutocompleteコンポーネントです。
 *
 * - `multiple`オプションは使用できません。
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
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.getters['customers/items'].slice().sort((a, b) => {
        return a.abbrKana.localeCompare(b.abbrKana)
      })
    },
  },
}
</script>

<template>
  <g-autocomplete
    v-bind="$attrs"
    item-text="abbr"
    item-value="docId"
    :items="items"
    v-on="$listeners"
  >
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
  </g-autocomplete>
</template>

<style></style>
