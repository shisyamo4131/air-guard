<script>
/**
 * 削除ボタンコンポーネントです。
 * @author shisyamo4131
 *
 * @refact 2025-01-09
 */
import GIconDelete from '../icons/GIconDelete.vue'
import GBtn from './GBtn.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtn, GIconDelete },
}
</script>

<template>
  <g-btn v-bind="$attrs" v-on="$listeners">
    <template #icon="{ attrs }">
      <g-icon-delete v-bind="attrs" />
    </template>
    <slot name="default"><span>削除</span></slot>
  </g-btn>
</template>

<style></style>
