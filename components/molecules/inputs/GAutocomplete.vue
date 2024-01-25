<script>
import AAutocomplete from '../../atoms/inputs/AAutocomplete.vue'
/**
 * ## GAutocomplete
 * FireModelを継承したmodelをpropsで受け取り、ユーザーが入力した検索文字列に該当する
 * データをリスト表示するAutocompleteコンポーネントです。
 *
 * ユーザーの入力完了を待つことができるようにdelayプロパティを使用することができます。
 *
 * このコンポーネントはユーザーからの入力内容に該当するドキュメントをFirestoreから
 * 取得するとともに、modelのtokenFieldsに定義されたフィールドの値を参照する
 * filter()が既定されています。
 * props.filterは、このコンポーネントが既定するfilterを上書きするために使用します。
 * 但し、Firestoreからドキュメントを取得する条件（tokenFieldsを使ったNgrm検索）と
 * 異なるfilter()を定義することで、「ドキュメントデータは取得したが、リストに表示されない」
 * という現象が発生します。
 * ユーザーの入力文字列が削除されると、Autocompleteによる絞り込みが解除され、
 * itemsに格納されたすべてのデータがリスト表示されるため、
 * 「カナでの検索結果に出てこなかったデータが検索文字列を削除したらリストに出てきた」
 * という状況が発生します。
 * 基本的にprops.filterは使用しないことをお勧めします。
 *
 * Firestoreからの読み込み処理中であることを表現するためにloadingプロパティを使用しています。
 * このコンポーネントを使用する親コンポーネントからのloadingプロパティは無視されます。
 *
 * ### PROPS
 *
 * | name         | type                    | default   | required | description |
 * | ------------ | ----------------------- | --------- | -------- | ----------- |
 * | delay        | string, number          | 500       | false    |             |
 * | filter       | function                | undefined | true     |             |
 * | itemValue    | string, array, function | 'docId'   | false    |             |
 * | model        | object                  | -         | true     |             |
 * | multiple     | boolean                 | false     | false    |             |
 * | returnObject | boolean                 | false     | false    |             |
 * | value        | object, array           | null      | false    |             |
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { AAutocomplete },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    delay: { type: [String, Number], default: 500, required: false },
    filter: { type: Function, default: undefined, required: false },
    itemValue: {
      type: [String, Array, Function],
      default: 'docId',
      required: false,
    },
    model: { type: Object, required: true },
    multiple: { type: Boolean, default: false, required: false },
    returnObject: { type: Boolean, default: false, required: false },
    value: { type: [String, Object, Array], default: null, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      loading: false,
      searchInput: null,
      timerId: null,
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    // ユーザーからの入力内容に変更があった場合の処理
    // props.delayで指定されたミリ秒だけディレイを入れて該当するドキュメントを読み込む。
    // ### NOTE ###
    // props.multiple = false の際、選択肢からitemが選択されるとsearch-inputが
    // item-textで指定された値に更新されるため、どうしてもfetchDocs()が実行されてしまう。
    searchInput: {
      handler(v) {
        clearTimeout(this.timerId)
        if (v) {
          this.timerId = setTimeout(async () => {
            this.items = await this.model.fetchDocs(v)
            this.loading = false
          }, this.delay)
        }
      },
    },
    timerId(v) {
      this.loading = !!v
    },
    value: {
      async handler(v) {
        if (this.multiple) {
          if (!Array.isArray(v)) {
            // eslint-disable-next-line
            console.error('[GAutocomplete.vue] A value prop must be an array.')
            return
          }
          this.loading = true
          for (const i of v) {
            const docId = this.returnObject ? i.docId : i
            await this.setInitialValue(docId)
          }
          this.loading = false
        } else {
          const docId = this.returnObject ? v.docId : v
          this.loading = true
          await this.setInitialValue(docId)
          this.loading = false
        }
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 引数にdocIdを受け取り、itemsに指定されたdocIdのitemが存在しない場合、
     * modelから該当データを読み込み、itemsに追加します。
     * @param {string} v ドキュメントIDです。
     */
    async setInitialValue(v) {
      if (!v) return
      if (this.items.some(({ docId }) => docId === v)) return
      await this.model.fetch(v)
      this.items.push(JSON.parse(JSON.stringify(this.model)))
    },
    // Autocompleteコンポーネントに設定するfilter()の当該コンポーネントにおける既定処理です。
    // props.filterが設定されている場合は無視されます。
    // 引数で受け取るitemは当該コンポーネントにおいては必ずオブジェクトになります。
    // => Firestoreから取得したドキュメントデータであるため。
    // FireModelのtokenFieldsに設定されたフィールド全てに対して
    // queryTextが含まれるかどうかを検証し、1つでも含まれるものがあれば
    // trueを返します。
    defaultFilter(item, queryText, itemText) {
      const tokenFields = this.model.tokenFields
      const matchFields = tokenFields.filter((field) => {
        return item[field].includes(queryText)
      })
      return !!matchFields.length
    },
  },
}
</script>

<template>
  <a-autocomplete
    v-bind="$attrs"
    cache-items
    :filter="filter || defaultFilter"
    :items="items"
    :item-value="itemValue"
    :loading="loading"
    :multiple="multiple"
    :return-object="returnObject"
    :search-input.sync="searchInput"
    :value="value"
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
  </a-autocomplete>
</template>

<style></style>
