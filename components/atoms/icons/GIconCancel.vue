<script>
/**
 * ### GIconCancel
 * キャンセル操作を示すアイコンコンポーネントです。
 *
 * @version 1.0.0
 * @create 2024-06-18
 * @author shisyamo4131
 *
 * 概要:
 * GIconCancelコンポーネントは、Vuetifyの `v-icon` を使用してキャンセル操作を示すアイコンを表示します。
 * アイコンは常にmdi-closeを表示します。
 *
 * 使用例:
 * <GIconCancel />
 *
 * 更新履歴:
 * 2024-06-18 - 初版作成
 */

export default {}
</script>

<template>
  <v-icon v-bind="$attrs" v-on="$listeners">mdi-close</v-icon>
</template>

<style>
/* 必要に応じてスタイルを追加 */
</style>
