<script>
/**
 * ## GAutocompleteSite
 *
 * 現場選択用のAutocompleteコンポーネントです。
 *
 * - 選択可能な`site`オブジェクトはVuexから取得します。
 * - Vuexはstatusが`active`である`site`オブジェクトのみが読み込まれています。
 * - statusが`expired`である`site`オブジェクトが`$attrs.value`にセットされていた場合、
 *   当該オブジェクトを含めてリスト表示します。`$attrs.value`にセットされた値が`docId`である場合は
 *   Firestoreから当該ドキュメントをfetchします。
 *
 * - `multiple`オプションは使用できません。
 *
 * @author shisyamo4131
 * @version 1.1.0
 * @updates
 * - version 1.1.0 - 2024-09-18 - `computed.items`に存在しない値が`$attrs.value`にセットされた場合に対応。
 * - version 1.0.0 - 2024-xx-xx - 初版作成
 */
import { mapState } from 'vuex'
import GAutocomplete from './GAutocomplete.vue'
import Site from '~/models/Site'
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
      additionalItems: [],
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    ...mapState({
      items: (state) => state.sites.items,
    }),
    allItems() {
      return this.items.concat(this.additionalItems)
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    '$attrs.value': {
      async handler(v) {
        if (!v) return
        if (
          typeof v === 'string' &&
          !this.allItems.some(({ docId }) => docId === v)
        ) {
          await this.setAdditionalItem(v)
        } else if (typeof v === 'object') {
          await this.setAdditionalItem(v)
        }
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async setAdditionalItem(newItem) {
      if (typeof newItem === 'string') {
        const fetchedItem = await new Site().fetch(newItem)
        this.additionalItems.push(fetchedItem)
      } else if (typeof newItem === 'object') {
        this.additionalItems.push(newItem)
      }
    },
  },
}
</script>

<template>
  <g-autocomplete
    v-bind="$attrs"
    item-text="abbr"
    item-value="docId"
    :items="allItems"
    :multiple="false"
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
