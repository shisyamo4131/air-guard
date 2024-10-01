<script>
/**
 * ## GAutocompleteCustomer
 *
 * 取引先選択用のAutocompleteコンポーネントです。
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
      return this.$store.getters['customers/items']
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
