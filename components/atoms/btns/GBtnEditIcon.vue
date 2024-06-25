<script>
/**
 * ### GBtnEditIcon
 * 編集アイコンボタンを提供するコンポーネントです。
 *
 * @component
 * @example
 * <GBtnEditIcon @click="handleEdit" />
 *
 * @version 1.0.0
 * @date 2024-06-21
 * @author shisyamo4131
 *
 * 概要:
 * 編集操作を表すアイコンボタンです。Vuetifyのv-btnとカスタムアイコンコンポーネント
 * GIconEditを組み合わせています。
 *
 * 使用例:
 * <GBtnEditIcon @click="handleEdit" />
 *
 * 更新履歴:
 * 2024-06-21 - 初版作成
 */

import GIconEdit from '~/components/atoms/icons/GIconEdit.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GIconEdit },
}
</script>

<template>
  <v-btn v-bind="$attrs" icon v-on="$listeners">
    <g-icon-edit />
  </v-btn>
</template>

<style>
/* 必要に応じてスタイルを追加 */
</style>
