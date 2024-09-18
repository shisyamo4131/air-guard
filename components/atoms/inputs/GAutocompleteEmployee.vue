<script>
/**
 * ## GAutocompleteEmployee
 *
 * 従業員選択用のAutocompleteコンポーネントです。
 *
 * - 選択可能な`employee`オブジェクトはVuexから取得します。
 * - Vuexはstatusが`active`である`employee`オブジェクトのみが読み込まれています。
 * - statusが`expired`である`employee`オブジェクトが`$attrs.value`にセットされていた場合、
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
import Employee from '~/models/Employee'
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
      items: (state) => state.employees.items,
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
        const fetchedItem = await new Employee().fetch(newItem)
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
    item-text="fullName"
    item-value="docId"
    :items="allItems"
    :multiple="false"
    v-on="$listeners"
  >
  </g-autocomplete>
</template>

<style></style>
