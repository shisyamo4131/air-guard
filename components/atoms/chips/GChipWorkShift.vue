<script>
/**
 * ### GChipWorkShift
 * 勤務区分を表すChipコンポーネントです。
 *
 * @version 1.0.0
 * @create 2024-06-18
 * @author shisyamo4131
 *
 * 概要:
 * GChipWorkShiftコンポーネントは、勤務区分を表すためのVuetifyのChipコンポーネントです。
 * 勤務区分に応じて、色とアイコンが動的に変更されます。
 *
 * 主な機能:
 * - 勤務区分（workShift）に基づいて、Chipの色とアイコンを変更します。
 * - 勤務区分が "day" の場合は青色のChipと太陽のアイコンを表示します。
 * - 勤務区分が "night" の場合は赤色のChipと月のアイコンを表示します。
 *
 * 使用例:
 * <GChipWorkShift :workShift="'day'" />
 * <GChipWorkShift :workShift="'night'" />
 *
 * props設定:
 * - workShift: 勤務区分を表す文字列。"day" または "night" のいずれかを指定します。
 *
 * 更新履歴:
 * 2024-06-18 - 初版作成
 */

export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    workShift: {
      type: String,
      validator: (v) => ['day', 'night'].includes(v), // 勤務区分が "day" または "night" であることを検証
      required: true,
    },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    // 勤務区分に基づいてChipの色を返す
    color() {
      return this.workShift === 'day' ? 'blue white--text' : 'red white--text'
    },
    // 勤務区分に基づいてアイコン名を返す
    icon() {
      return this.workShift === 'day' ? 'weather-sunny' : 'weather-night'
    },
  },
}
</script>

<template>
  <v-chip v-bind="$attrs" :color="color" v-on="$listeners">
    <v-icon v-bind="$attrs" left>{{ `mdi-${icon}` }}</v-icon
    >{{ $WORK_SHIFT[value] }}
  </v-chip>
</template>

<style>
/* 必要に応じてスタイルを追加 */
</style>
