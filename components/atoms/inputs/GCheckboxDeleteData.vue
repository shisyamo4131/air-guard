<script>
/**
 * ## GCheckboxDeleteData
 *
 * - ユーザーからデータの削除指示を受け付けるためのCheckboxコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-04 - 初版作成
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
    label: { type: String, default: 'このデータを削除する', required: false },
  },
}
</script>

<template>
  <g-checkbox v-bind="$attrs" :label="label" v-on="$listeners" />
</template>

<style></style>
