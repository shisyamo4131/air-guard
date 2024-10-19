<script>
/**
 * ## GAutocompleteSite
 *
 * 現場選択用のAutocompleteコンポーネントです。
 * - items には Vuex の sites が読み込まれます。
 *
 * @author shisyamo4131
 * @version 2.1.0
 * @updates
 * - version 2.1.0 - 2024-10-19 - props.label で既定値を`現場`に設定
 *                              - props.itemText で既定値を abbr に設定
 *                              - props.itemValue で既定値を docId に設定
 *                              - mutilple を使用可能に変更
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
