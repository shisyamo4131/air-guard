<script>
/**
 * ## GChipGroupKanaFilter
 *
 * カタカナの行（ア～ワ）から1つを選択し、対応する正規表現を親コンポーネントに返すための選択コンポーネントです。
 *
 * - ユーザーは「ア」「カ」「サ」などのカタカナの行から1つを選択できます。
 * - 選択された行に対応する正規表現（例: /[アイウエオ]/）を `update:regex` イベントで親コンポーネントが受け取ることができます。
 * - 親コンポーネントから `value` プロパティで初期値を設定できますが、省略された場合は「ア」がデフォルトで選択されます。
 * - `watch` の `immediate` オプションを利用して、初期化時に正規表現を自動的に返します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-04 - 初版作成
 */

export default {
  /***************************************************************************
   * MODEL
   ***************************************************************************/
  model: { prop: 'value', event: 'change' },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    chipOptions: { type: Object, default: () => ({}), required: false },
    value: { type: String, default: 'ア', required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      internalValue: this.value,
      regexMap: {
        ア: /^[アイウエオ]/,
        カ: /^[カキクケコガギグゲゴ]/,
        サ: /^[サシスセソザジズゼゾ]/,
        タ: /^[タチツテトダヂヅデド]/,
        ナ: /^[ナニヌネノ]/,
        ハ: /^[ハヒフヘホバビブベボパピプペポ]/,
        マ: /^[マミムメモ]/,
        ヤ: /^[ヤユヨ]/,
        ラ: /^[ラリルレロ]/,
        ワ: /^[ワヲン]/,
      },
      chars: ['ア', 'カ', 'サ', 'タ', 'ナ', 'ハ', 'マ', 'ヤ', 'ラ', 'ワ'],
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    value: {
      handler(v) {
        this.internalValue = v
      },
      immediate: true,
    },
    internalValue: {
      handler(v) {
        this.$emit('change', v)
        const selectedRegex = this.regexMap[v]
        this.$emit('update:regex', selectedRegex) // 正規表現を親に返す
      },
      immediate: true,
    },
  },
}
</script>

<template>
  <v-chip-group
    v-bind="{ ...$attrs, ...$props }"
    v-model="internalValue"
    active-class="primary--text"
    mandatory
    v-on="$listeners"
  >
    <v-chip
      v-for="char in chars"
      :key="char"
      :style="{ cursor: 'pointer' }"
      v-bind="{ ...$props.chipOptions }"
      :value="char"
    >
      {{ char }}
    </v-chip>
  </v-chip-group>
</template>

<style></style>
