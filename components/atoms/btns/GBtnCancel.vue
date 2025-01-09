<script>
/**
 * キャンセルボタンコンポーネントです。
 * @author shisyamo4131
 *
 * @refact 2025-01-09
 */
import GIconCancel from '../icons/GIconCancel.vue'
import GBtn from './GBtn.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtn, GIconCancel },
}
</script>

<template>
  <g-btn v-bind="$attrs" v-on="$listeners">
    <template #icon="{ attrs }">
      <g-icon-cancel v-bind="attrs" />
    </template>
    <slot name="default"><span>キャンセル</span></slot>
  </g-btn>
</template>

<style></style>
