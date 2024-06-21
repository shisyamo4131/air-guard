<script>
import { collection, getDocs, query, where } from 'firebase/firestore'
import GAutocomplete from './GAutocomplete.vue'

/**
 * ### GAutocompleteFirestore
 * Firestoreと連携してアイテムを検索するための拡張オートコンプリートコンポーネントです。
 *
 * @component
 * @example
 * <GAutocompleteFirestore :model="model" />
 *
 * @props {Object} model - FireModelを継承したインスタンス
 * @props {Boolean} multiple - 複数選択を許可するかどうか
 * @props {Function} filter - アイテムのフィルタリング関数
 * @props {String|Array|Function} itemValue - アイテムの値を取得するプロパティ
 *
 * @version 1.0.0
 * @create 2024-06-20
 * @author shisyamo4131
 *
 * 概要:
 * Firestoreのコレクションからドキュメントを検索し、オートコンプリート入力フィールドに表示します。
 * 選択されたアイテムは指定されたプロパティにバインドされます。
 *
 * 主な機能:
 * - Firestoreからのアイテム検索と表示
 * - 複数選択のサポート
 * - 選択されたアイテムのキャッシュ
 * - 検索文字列に基づく動的なアイテムの絞り込み
 *
 * 更新履歴:
 * 2024-06-20 - 初版作成
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GAutocomplete },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    filter: {
      type: Function,
      default: () => {
        return true
      },
      required: false,
    },
    itemValue: {
      type: [String, Array, Function],
      default: 'docId',
      required: false,
    },
    model: { type: Object, required: true }, // FireModelを継承したクラスオブジェクト
    multiple: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      isInitSet: false,
      items: [],
      lazySearch: null,
      loading: false,
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    '$attrs.value': {
      async handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          await this.updateItemsFromValue(newVal)
        }
      },
      immediate: true,
    },
    lazySearch: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.fetchMatchingItems(newVal)
        }
      },
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * ドキュメントをitems配列に追加します。
     * @param {Object} item - 追加するドキュメントオブジェクト
     */
    addItem(item) {
      if (!this.items.some(({ docId }) => docId === item.docId)) {
        this.items.push(item)
      }
    },
    /**
     * 指定されたドキュメントIDのリストに基づいて、Firestoreからドキュメントを取得します。
     * @param {Array} ids - 取得するドキュメントIDのリスト
     * @returns {Array} - 取得したドキュメントの配列
     */
    async fetchItemsByIds(ids) {
      const colRef = collection(this.$firestore, this.model.collection)
      const q = query(colRef, where('docId', 'in', ids))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => doc.data())
    },
    /**
     * プロパティ`$attrs.value`の値に基づいてitems配列を更新します。
     * @param {Array|Object|string} newVal - 新しい値
     */
    async updateItemsFromValue(newVal) {
      if (!this.model || !newVal) return

      if (Array.isArray(newVal)) {
        if (!newVal.length) return
        if (typeof newVal[0] === 'object') {
          newVal.forEach(this.addItem)
        } else {
          const uniqueIds = [...new Set(newVal.map((docId) => docId))].filter(
            (docId) => !this.items.some((item) => item.docId === docId)
          )
          if (!uniqueIds.length) return
          this.loading = true
          try {
            const chunkedIds = uniqueIds.flatMap((_, i, a) =>
              i % 30 ? [] : [a.slice(i, i + 30)]
            )
            const promises = chunkedIds.map(async (ids) => {
              const items = await this.fetchItemsByIds(ids)
              items.forEach(this.addItem)
            })
            await Promise.all(promises)
          } catch (err) {
            // eslint-disable-next-line
            console.error(err)
            alert(err.message)
          } finally {
            this.loading = false
          }
        }
      } else if (typeof newVal === 'object') {
        this.addItem(newVal)
      } else if (typeof newVal === 'string') {
        if (!this.items.some((item) => item.docId === newVal)) {
          await this.model.fetchDoc(newVal)
          this.items.push(JSON.parse(JSON.stringify(this.model)))
        }
      }
      this.isInitSet = true
    },
    /**
     * プロパティ`lazySearch`の値に基づいてFirestoreからドキュメントを取得し、items配列を更新します。
     * @param {string} searchTerm - 検索文字列
     */
    async fetchMatchingItems(searchTerm) {
      if (this.isInitSet || !this.model || !searchTerm) {
        this.isInitSet = false
        return
      }
      this.loading = true
      try {
        const fetchItems = await this.model.fetchDocs(searchTerm)
        fetchItems.forEach((item) => {
          if (!this.items.some(({ docId }) => docId === item.docId)) {
            this.items.push(item)
          }
        })
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <g-autocomplete
    v-bind="$attrs"
    :cache-items="multiple"
    :filter="filter"
    :items="items"
    :item-value="itemValue"
    :loading="loading"
    :multiple="multiple"
    @update:lazy-search="lazySearch = $event"
    v-on="$listeners"
  >
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
  </g-autocomplete>
</template>

<style></style>
