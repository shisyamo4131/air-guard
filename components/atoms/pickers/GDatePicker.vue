<script>
/**
 * ### GDatePicker
 * Vuetifyのv-date-pickerを拡張したカスタム日付ピッカーコンポーネントです。
 *
 * @component
 * @example
 * <GDatePicker v-model="selectedDate" />
 *
 * @props {String} color - カラーテーマの設定
 * @props {String} locale - ロケール設定
 * @props {Function} dayFormat - 日付の表示フォーマット
 * @props {Number} firstDayOfWeek - 週の最初の日を設定
 *
 * @version 1.0.0
 * @date 2024-06-21
 * @author shisyamo4131
 *
 * 概要:
 * GDatePickerコンポーネントは、Vuetifyのv-date-pickerを拡張し、日本語ロケール、
 * カラーテーマ、および日付の表示フォーマットをサポートするコンポーネントです。
 *
 * 主な機能:
 * - 日本語ロケールの設定
 * - プライマリカラーテーマの適用
 * - 日付の表示フォーマットのカスタマイズ
 * - 週の最初の日を月曜日に設定
 *
 * 使用例:
 * <GDatePicker v-model="selectedDate" />
 *
 * 更新履歴:
 * 2024-06-21 - 初版作成
 */
export default {}
</script>

<template>
  <v-date-picker
    v-bind="$attrs"
    color="primary"
    locale="ja-jp"
    :day-format="(date) => new Date(date).getDate()"
    first-day-of-week="1"
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
  </v-date-picker>
</template>

<style></style>
