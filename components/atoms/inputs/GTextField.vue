<script>
/**
 * #### サロゲートペア使用文字の拒否（air-vuetify実装候補）
 * FirestoreでNgram方式によるあいまい検索を実装する際、tokenMapフィールドの
 * プロパティ名に使用される文字は有効なUTF-8範囲内の文字に限定されます。
 * props.ignoreSurrogatePair を true にするとサロゲートペア使用文字が
 * 含まれている場合にエラーとすることが可能です。
 *
 * @author shisyamo4131
 * @refact 2025-02-08
 */

// エラーメッセージ
const ERROR_KATAKANA =
  '全角カタカナ、スペース、全角数字、「・」、「／」のみ使用可能です'

const ERROR_SURROGATE = '使用できない文字が含まれています'

// バリデーター
const RULE_KATAKANA = (v) => /^[\u30A1-\u30F6ー\x20\u3000０-９・／]+$/.test(v)
const REGEX_SURROGATE = /[\uD800-\uDBFF][\uDC00-\uDFFF]/

export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    dense: { type: Boolean, default: true, required: false },
    ignoreSurrogatePair: { type: Boolean, default: false, required: false },
    katakanaError: { type: String, default: ERROR_KATAKANA, required: false },
    katakanaRule: { type: Function, default: RULE_KATAKANA, required: false },
    label: { type: String, default: undefined, required: false },
    outlined: { type: Boolean, default: true, required: false },
    required: { type: Boolean, default: false, required: false },
    requiredError: { type: String, default: '必須入力です', required: false },
    rules: { type: Array, default: () => [], required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      // surrogateError: '使用できない文字が含まれています',
      surrogateRule: (v) =>
        !this.ignoreSurrogatePair ||
        !this.containsSurrogatePair(v) ||
        ERROR_SURROGATE,
    }
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 引数に与えられた文字列がサロゲートペア使用文字を含む場合にtrueを
     * 含まない場合にfalseを返します。
     */
    containsSurrogatePair(inputString) {
      return REGEX_SURROGATE.test(inputString)
    },
  },
}
</script>

<template>
  <air-text-field
    v-bind="{ ...$props, ...$attrs }"
    :rules="[...rules, surrogateRule]"
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
  </air-text-field>
</template>

<style></style>
