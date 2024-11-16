<script>
/**
 * ## GCheckboxDeleteData
 *
 * - ユーザーからデータの削除指示を受け付けるためのCheckboxコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.1.0
 * @updates
 * - version 1.0.0 - 2024-10-04 - 初版作成
 * - version 1.1.0 - 2024-11-15 - hide-details の初期値を true に設定
 */

import GCheckbox from './GCheckbox.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCheckbox },

  /***************************************************************************
   * MODEL
   ***************************************************************************/
  model: {
    prop: 'input-value',
    event: 'change',
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    hideDetails: { type: Boolean, default: true, required: false },
    label: { type: String, default: 'このデータを削除する', required: false },
  },
}
</script>

<template>
  <g-checkbox v-bind="{ ...$props, ...$attrs }" v-on="$listeners" />
</template>

<style></style>
