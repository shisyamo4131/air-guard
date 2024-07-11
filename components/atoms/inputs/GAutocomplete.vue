<script>
/**
 * ### GAutocomplete
 *
 * GAutocompleteはAirAutocompleteを拡張したコンポーネントで、遅延検索機能を追加しています。
 * ユーザーが入力した内容に基づいて動的に検索結果を表示します。
 *
 * #### UPDATE
 * - version 1.1.0 - 2024-07-10 - requiredが設定されている場合に`*`を表示するように修正
 * ‐ version 1.0.0 - 2024-06-21 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.1.0
 */

export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    delay: { type: Number, default: 500, required: false },
    dense: { type: Boolean, default: true, required: false },
    label: { type: String, default: undefined, required: false },
    outlined: { type: Boolean, default: true, required: false },
    required: { type: Boolean, default: false, required: false },
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
    <template v-if="label" #label>
      {{ label }}<span v-if="required" class="red--text">*</span>
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
  </air-autocomplete>
</template>

<style></style>
