<script>
/**
 * ### GAutocomplete
 * @version 1.0.0
 * @date 2024-06-20
 * @author shisyamo4131
 *
 * 概要:
 * GAutocompleteはAirAutocompleteを拡張したコンポーネントで、遅延検索機能を追加しています。
 * ユーザーが入力した内容に基づいて動的に検索結果を表示します。
 *
 * 主な機能:
 * - 遅延検索: 入力内容に応じて一定の遅延後に検索を実行します。
 * - 検索結果の同期: 親コンポーネントから渡されたsearchInputを内部で同期します。
 *
 * 使用例:
 * <GAutocomplete v-model="selectedItem" :items="items" />
 *
 * props設定:
 * - delay: 検索実行までの遅延時間（ミリ秒）
 * - dense: コンポーネントの見た目を密にする
 * - outlined: 枠線を表示する
 * - requiredError: 必須入力エラー時のメッセージ
 *
 * 更新履歴:
 * 2024-06-20 - 初版作成
 */

export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    delay: { type: Number, default: 500, required: false },
    dense: { type: Boolean, default: true, required: false },
    outlined: { type: Boolean, default: true, required: false },
    requiredError: { type: String, default: '必須入力', required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      internalSearchInput: undefined,
      timerId: null,
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    '$attrs.searchInput': {
      handler(v) {
        this.internalSearchInput = v
      },
      immediate: true,
    },
    internalSearchInput: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        clearTimeout(this.timerId)
        this.timerId = setTimeout(() => {
          this.$emit('update:lazy-search', newVal)
        }, this.delay)
      },
      immediate: true,
    },
  },
}
</script>

<template>
  <air-autocomplete
    v-bind="{ ...$props, ...$attrs }"
    :search-input.sync="internalSearchInput"
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
  </air-autocomplete>
</template>

<style></style>
