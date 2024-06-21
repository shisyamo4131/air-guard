<script>
/**
 * ### GIconRegist
 * 登録操作を示すアイコンコンポーネントです。
 *
 * @version 1.0.0
 * @create 2024-06-18
 * @author shisyamo4131
 *
 * 概要:
 * GIconRegistコンポーネントは、Vuetifyの `v-icon` を使用して登録操作を示すアイコンを表示します。
 * アイコンは常にmdi-plusを表示します。
 *
 * 使用例:
 * <GIconRegist />
 *
 * 更新履歴:
 * 2024-06-18 - 初版作成
 */

export default {}
</script>

<template>
  <v-icon v-bind="$attrs" v-on="$listeners"> mdi-plus </v-icon>
</template>

<style>
/* 必要に応じてスタイルを追加 */
</style>
