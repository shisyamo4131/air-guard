<script>
/**
 * ### GBtnRegistIcon
 * 登録アイコンボタンを提供するコンポーネントです。
 *
 * @component
 * @example
 * <GBtnRegistIcon @click="handleRegist" />
 *
 * @version 1.0.0
 * @date 2024-06-21
 * @autor shisyamo4131
 *
 * 概要:
 * 登録操作を表すアイコンボタンです。Vuetifyのv-btnとカスタムアイコンコンポーネント
 * GIconRegistを組み合わせています。
 *
 * 使用例:
 * <GBtnRegistIcon @click="handleRegist" />
 *
 * 更新履歴:
 * 2024-06-21 - 初版作成
 */

import GIconRegist from '~/components/atoms/icons/GIconRegist.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GIconRegist },
}
</script>

<template>
  <v-btn v-bind="$attrs" icon v-on="$listeners">
    <g-icon-regist />
  </v-btn>
</template>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
