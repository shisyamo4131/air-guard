<script>
/**
 * ### GSwitch
 *
 * VSwitchを拡張したカスタムスイッチコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.1.0
 *
 * @updates
 * - version 1.1.0 - 2024-07-17 - labelスロットの既定を変更。
 * - version 1.0.0 - 2024-06-21 - 初版作成
 */
export default {
  /***************************************************************************
   * MODEL
   ***************************************************************************/
  model: {
    prop: 'input-value',
    event: 'change',
  },
  props: {
    label: { type: String, default: undefined, required: false },
  },
}
</script>

<template>
  <v-switch v-bind="$attrs" v-on="$listeners">
    <template #label>
      <slot name="label">
        <div class="text-caption">{{ label }}</div>
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
  </v-switch>
</template>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
