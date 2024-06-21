<script>
/**
 * ### GTextarea
 * AirTextareaを拡張したカスタムテキストエリアコンポーネントです。
 *
 * @component
 * @example
 * <GTextarea v-model="textValue" />
 *
 * @props {Boolean} outlined - コンポーネントのアウトライン表示設定
 * @props {String} requiredError - 必須入力エラー時のメッセージ
 *
 * @version 1.0.0
 * @date 2024-06-21
 * @autor shisyamo4131
 *
 * 概要:
 * GTextareaコンポーネントは、AirTextareaを拡張し、デフォルトで
 * アウトライン表示をサポートするコンポーネントです。
 *
 * 主な機能:
 * - アウトライン表示のサポート
 * - 必須入力エラーメッセージの設定
 *
 * 使用例:
 * <GTextarea v-model="textValue" />
 *
 * props設定:
 * - outlined: コンポーネントのアウトライン表示設定
 * - requiredError: 必須入力エラー時のメッセージ
 *
 * 更新履歴:
 * 2024-06-21 - 初版作成
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    outlined: {
      type: Boolean,
      default: true,
      required: false,
    },
    requiredError: {
      type: String,
      default: '必須入力です',
      required: false,
    },
  },
}
</script>

<template>
  <air-textarea v-bind="{ ...$props, ...$attrs }" v-on="$listeners">
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
  </air-textarea>
</template>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
