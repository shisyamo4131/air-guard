<script>
/**
 * ### GSwitch
 * VSwitchを拡張したカスタムスイッチコンポーネントです。
 *
 * @component
 * @example
 * <GSwitch v-model="switchValue" />
 *
 * @model {String} prop - v-modelのプロパティ名 ('input-value')
 * @model {String} event - v-modelのイベント名 ('change')
 *
 * @version 1.0.0
 * @date 2024-06-21
 * @author shisyamo4131
 *
 * 概要:
 * GSwitchコンポーネントは、VuetifyのVSwitchを拡張し、v-modelのプロパティ名とイベント名を
 * カスタマイズできるコンポーネントです。
 *
 * 主な機能:
 * - v-modelのプロパティ名とイベント名のカスタマイズ
 *
 * 使用例:
 * <GSwitch v-model="switchValue" />
 *
 * model設定:
 * - prop: v-modelのプロパティ名 ('input-value')
 * - event: v-modelのイベント名 ('change')
 *
 * 更新履歴:
 * 2024-06-21 - 初版作成
 */
export default {
  /***************************************************************************
   * MODEL
   ***************************************************************************/
  model: {
    prop: 'input-value',
    event: 'change',
  },
}
</script>

<template>
  <v-switch v-bind="$attrs" v-on="$listeners">
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
