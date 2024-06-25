<script>
/**
 * ### GBtnCancelIcon
 * キャンセルアイコンボタンを提供するコンポーネントです。
 *
 * @component
 * @example
 * <GBtnCancelIcon @click="handleCancel" />
 *
 * @version 1.0.0
 * @date 2024-06-21
 * @author shisyamo4131
 *
 * 概要:
 * キャンセル操作を表すアイコンボタンです。Vuetifyのv-btnとカスタムアイコンコンポーネント
 * GIconCancelを組み合わせています。
 *
 * 使用例:
 * <GBtnCancelIcon @click="handleCancel" />
 *
 * 更新履歴:
 * 2024-06-21 - 初版作成
 */

import GIconCancel from '~/components/atoms/icons/GIconCancel.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GIconCancel },
}
</script>

<template>
  <v-btn v-bind="$attrs" icon v-on="$listeners">
    <g-icon-cancel />
  </v-btn>
</template>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
