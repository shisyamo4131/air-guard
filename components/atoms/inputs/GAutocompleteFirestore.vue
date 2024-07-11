<script>
/**
 * ### GAutocompleteFirestore
 *
 * Firestoreと連携してアイテムを検索するための拡張オートコンプリートコンポーネントです。
 *
 * #### 機能詳細
 * - コンポーネントに入力された検索文字列に該当するドキュメントのNgram検索によって抽出します。
 * - 初期値として値が与えられるケースも想定しています。
 *
 * #### 注意事項
 * 1. FirestoreのNgram検索で固定されているため、`props.filter`は使用できません。
 * 2. `props.item-text`は表示に関わる部分のみ影響します。filterには影響しません。
 * 3. Firestoreドキュメントの検索に特化しているため、`itemValue`は`docId`で固定されます。
 *
 * #### 開発備忘録
 * `slots.selection`で`props.item-text`の値を表示し、これを置換できるように
 * selectionスロットを用意しています。
 * [理由]
 * 以下の条件下でドキュメントの読み込みが2回発生する。
 * - `props.multiple`がfalse
 * - `$attrs.value`に初期値が設定されている
 * 原因はAutocompleteのsearch-inputに初期アイテムのitem-textが設定されるため。
 * これにより
 * 1. updateItemsFromValue()でドキュメントを取得（1度目の取得）
 * 2. 取得したitemのitem-textの値がsearch-inputに設定
 * 3. fetchMatchingItems()でドキュメントを取得（2度目の取得）
 * の処理が実行される。
 * 条件を満たす場合にfetchMatchingItems()でドキュメントを取得しないように
 * 上記(1)でフラグを立て、上記(3)でフラグを解除する仕組みで試してみたが、
 * `slots.selection`を使用した場合はitem-textの値がsearch-inputに入ってこないため、
 * フラグ解除にはユーザーが2度、検索文字列を入力しなければならなくなる。
 * そもそもitem-textの値がsearch-inputに入ってきてしまうことが問題であるため、
 * 「`slots.selection`を使用するとitem-textの値がsearch-inputに入ってこない」仕様を
 * 利用してitem-textの値をそのまま`slots.selection`で表示するようにしてみた。
 * [selectionを使用しない場合]
 * - 「りんご」が選択されている状態で「みかん」を入力した場合、「りんごみかん」の検索が行われる。
 * - 「りんご」が選択されている状態でbackSpaceすると「りん」で検索が行われる。
 * [selectionを使用した場合]
 * - 「りんご」が選択されている状態で「みかん」を入力した場合、「みかん」の検索が行われる。
 * - 「りんご」が選択されている状態でbackSpaceすると選択が解除される。
 *   -> `props.multiple`がtrueの時と同じような挙動になる。
 * どちらも該当するアイテムを選択した場合は、当該アイテムで選択値が上書きされる。
 * 2度の読み込みを回避する手段としては適当と判断。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * #### 更新履歴
 * - version 1.0.0 - 2024-06-20 - 初版作成
 */
import { collection, getDocs, query, where } from 'firebase/firestore'
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
    itemText: {
      type: [String, Array, Function],
      default: 'text',
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
      filter: (item, queryText, itemText) => {
        const createNgrams = (str) => {
          const ngrams = []
          for (let i = 0; i < str.length; i++) {
            for (let j = 1; j <= 2; j++) {
              if (i + j <= str.length) {
                ngrams.push(str.slice(i, i + j))
              }
            }
          }
          return ngrams
        }
        // 検索文字列をNgramに分割
        const searchNgrams = createNgrams(queryText)

        // 配列内のオブジェクトのtokenMapと検索文字列のNgramを比較
        return searchNgrams.every((ngram) => item.tokenMap[ngram])
      },
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
     * @returns {Promise} - 取得したドキュメントの配列
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
          await this.model.fetch(newVal)
          this.items.push(JSON.parse(JSON.stringify(this.model)))
        }
      }
    },
    /**
     * プロパティ`lazySearch`の値に基づいてFirestoreからドキュメントを取得し、items配列を更新します。
     * @param {string} searchTerm - 検索文字列
     */
    async fetchMatchingItems(searchTerm) {
      if (!this.model || !searchTerm) return
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
    selectionValue(item) {
      if (!this.itemText) return null
      const typeOf = typeof this.itemText
      if (typeOf === 'string') {
        return item?.[this.itemText] || null
      }
      if (typeOf === 'object' && Array.isArray(this.itemText)) {
        return this.itemText
          .map((key) => {
            return item?.[key] || ''
          })
          .join('')
      }
      if (typeOf === 'function') {
        return this.itemText(item)
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
    :item-text="itemText"
    item-value="docId"
    :loading="loading"
    :multiple="multiple"
    @update:lazy-search="lazySearch = $event"
    v-on="$listeners"
  >
    <template #selection="props">
      <slot name="selection" v-bind="props">
        {{ selectionValue(props.item) }}
      </slot>
    </template>
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
