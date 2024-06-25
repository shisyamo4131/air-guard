<script>
/**
 * ### GSelect
 * AirSelectを拡張したカスタムセレクトコンポーネントです。
 *
 * @component
 * @example
 * <GSelect :items="items" v-model="selectedItem" />
 *
 * @props {Boolean} dense - コンポーネントの密度設定
 * @props {Object} menuProps - メニューのプロパティ設定
 * @props {Boolean} outlined - コンポーネントのアウトライン表示設定
 * @props {String} requiredError - 必須入力エラー時のメッセージ
 *
 * @version 1.0.0
 * @date 2024-06-21
 * @author shisyamo4131
 *
 * 概要:
 * GSelectコンポーネントは、AirSelectを拡張し、デフォルトで
 * 密度設定とアウトライン表示、メニューのプロパティ設定をサポートするコンポーネントです。
 *
 * 主な機能:
 * - 密度設定とアウトライン表示のサポート
 * - メニューのプロパティ設定
 * - 必須入力エラーメッセージの設定
 *
 * 使用例:
 * <GSelect :items="items" v-model="selectedItem" />
 *
 * props設定:
 * - dense: コンポーネントの密度設定
 * - menuProps: メニューのプロパティ設定
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
    menuProps: {
      type: Object,
      default: () => ({ 'offset-y': true }),
      required: false,
    },
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
  <air-select v-bind="{ ...$props, ...$attrs }" v-on="$listeners">
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
  </air-select>
</template>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
