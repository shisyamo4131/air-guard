<script>
/**
 * ### GNumeric
 * AirNumericを拡張したカスタム数値入力コンポーネントです。
 *
 * @component
 * @example
 * <GNumeric v-model="numericValue" />
 *
 * @props {Boolean} dense - コンポーネントの密度設定
 * @props {Boolean} outlined - コンポーネントのアウトライン表示設定
 * @props {String} requiredError - 必須入力エラー時のメッセージ
 *
 * @version 1.0.0
 * @date 2024-06-21
 * @author shisyamo4131
 *
 * 概要:
 * GNumericコンポーネントは、AirNumericを拡張し、デフォルトで
 * 密度設定とアウトライン表示をサポートするコンポーネントです。
 *
 * 主な機能:
 * - 密度設定とアウトライン表示のサポート
 * - 必須入力エラーメッセージの設定
 *
 * 使用例:
 * <GNumeric v-model="numericValue" />
 *
 * props設定:
 * - dense: コンポーネントの密度設定
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
    dense: {
      type: Boolean,
      default: true,
      required: false,
    },
    outlined: {
      type: Boolean,
      default: true,
      required: false,
    },
    requiredError: {
      type: String,
      default: '必須入力',
      required: false,
    },
  },
}
</script>

<template>
  <air-numeric v-bind="{ ...$props, ...$attrs }" v-on="$listeners">
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
  </air-numeric>
</template>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
