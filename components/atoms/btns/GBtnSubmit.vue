<script>
/**
 * 確定ボタンコンポーネントです。
 * @author shisyamo4131
 *
 * @refact 2025-01-09
 */
import GIconSubmit from '../icons/GIconSubmit.vue'
import GBtn from './GBtn.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtn, GIconSubmit },
}
</script>

<template>
  <g-btn v-bind="$attrs" v-on="$listeners">
    <template #icon="{ attrs }">
      <g-icon-submit v-bind="attrs" />
    </template>
    <slot name="default"><span>確定</span></slot>
  </g-btn>
</template>

<style></style>
