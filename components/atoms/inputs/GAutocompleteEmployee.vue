<script>
/**
 * ## GAutocompleteEmployee
 *
 * 従業員選択用のAutocompleteコンポーネントです。
 *
 * - `multiple`オプションは使用できません。
 *
 * @author shisyamo4131
 * @version 2.0.0
 * @updates
 * - version 2.0.0 - 2024-10-01 - Vuexがインデックスデータを管理するようになったことによる修正。
 * - version 1.1.0 - 2024-09-18 - `computed.items`に存在しない値が`$attrs.value`にセットされた場合に対応。
 * - version 1.0.0 - 2024-xx-xx - 初版作成
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
    :multiple="false"
    v-on="$listeners"
  >
  </g-autocomplete>
</template>

<style></style>
