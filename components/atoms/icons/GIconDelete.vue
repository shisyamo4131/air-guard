<script>
/**
 * ### GIconDelete
 * 削除操作を示すアイコンコンポーネントです。
 *
 * @version 1.0.0
 * @create 2024-06-18
 * @author shisyamo4131
 *
 * 概要:
 * GIconDeleteコンポーネントは、Vuetifyの `v-icon` を使用して削除操作を示すアイコンを表示します。
 * アイコンは常にmdi-deleteを表示します。
 *
 * 使用例:
 * <GIconDelete />
 *
 * 更新履歴:
 * 2024-06-18 - 初版作成
 */

export default {}
</script>

<template>
  <v-icon v-bind="{ ...$props, ...$attrs }" v-on="$listeners">
    mdi-delete
  </v-icon>
</template>

<style>
/* 必要に応じてスタイルを追加 */
</style>
