<script>
/**
 * 編集ボタンコンポーネントです。
 * @author shisyamo4131
 *
 * @refact 2025-01-09
 */
import GIconEdit from '../icons/GIconEdit.vue'
import GBtn from './GBtn.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtn, GIconEdit },
}
</script>

<template>
  <g-btn v-bind="$attrs" v-on="$listeners">
    <template #icon="{ attrs }">
      <g-icon-edit v-bind="attrs" />
    </template>
    <slot name="default"><span>編集</span></slot>
  </g-btn>
</template>

<style></style>
