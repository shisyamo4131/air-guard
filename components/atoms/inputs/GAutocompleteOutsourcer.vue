<script>
/**
 * ## GAutocompleteOutsourcer
 *
 * 外注先選択用のAutocompleteコンポーネントです。
 *
 * - `multiple`オプションは使用できません。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-02 - 初版作成
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
      return this.$store.getters['outsourcers/items']
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
    :multiple="false"
    v-on="$listeners"
  >
  </g-autocomplete>
</template>

<style></style>
