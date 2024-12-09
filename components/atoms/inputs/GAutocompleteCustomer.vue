<script>
/**
 * 取引先選択用のAutocompleteコンポーネントです。
 *
 * - 選択可能なアイテムは Vuex から取得します。
 * - props.docIds で指定された取引先 ID のみに絞り込むことが可能です。
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
    label: { type: String, default: '取引先' },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    internalItems() {
      const filteredItems = this.$store.getters['customers/items'].filter(
        (item) => {
          return !this.docIds.length || this.docIds.includes(item.docId)
        }
      )
      return filteredItems.sort((a, b) => {
        return a.abbrKana.localeCompare(b.abbrKana)
      })
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
