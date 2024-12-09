<script>
/**
 * 現場選択用のAutocompleteコンポーネントです。
 *
 * - 選択可能なアイテムは Vuex から取得します。
 * - props.docIds で指定された現場IDのみに絞り込むことが可能です。
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
    docIds: { type: Array, default: () => [], required: false },
    itemText: { type: String, default: 'abbr' },
    label: { type: String, default: '現場' },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    internalItems() {
      const filteredItems = this.$store.getters['sites/items'].filter(
        (item) => {
          return !this.docIds.length || this.docIds.includes(item.docId)
        }
      )
      return filteredItems.sort((a, b) => {
        return a.abbrKana.localeCompare(b.abbrKana)
      })
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
    :items="internalItems"
    item-value="docId"
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
