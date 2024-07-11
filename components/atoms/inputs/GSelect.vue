<script>
/**
 * ### GSelect
 *
 * AirSelectを拡張したカスタムセレクトコンポーネントです。
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
    dense: { type: Boolean, default: true, required: false },
    menuProps: {
      type: Object,
      default: () => ({ 'offset-y': true }),
      required: false,
    },
    label: { type: String, default: undefined, required: false },
    outlined: { type: Boolean, default: true, required: false },
    required: { type: Boolean, default: false, required: false },
    requiredError: { type: String, default: '必須入力です', required: false },
  },
}
</script>

<template>
  <air-select v-bind="{ ...$props, ...$attrs }" v-on="$listeners">
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
  </air-select>
</template>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
