<script>
/**
 * ### GBtnSubmitIcon
 * 提出アイコンボタンを提供するコンポーネントです。
 *
 * @component
 * @example
 * <GBtnSubmitIcon @click="handleSubmit" />
 *
 * @version 1.0.0
 * @date 2024-06-21
 * @autor shisyamo4131
 *
 * 概要:
 * 提出操作を表すアイコンボタンです。Vuetifyのv-btnとカスタムアイコンコンポーネント
 * GIconSubmitを組み合わせています。
 *
 * 使用例:
 * <GBtnSubmitIcon @click="handleSubmit" />
 *
 * 更新履歴:
 * 2024-06-21 - 初版作成
 */

import GIconSubmit from '~/components/atoms/icons/GIconSubmit.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GIconSubmit },
}
</script>

<template>
  <v-btn v-bind="$attrs" icon v-on="$listeners">
    <g-icon-submit />
  </v-btn>
</template>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
