<script>
/**
 * 前へボタンコンポーネントです。
 * @author shisyamo4131
 *
 * @refact 2025-01-09
 */
import GIconPrev from '../icons/GIconPrev.vue'
import GBtn from './GBtn.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtn, GIconPrev },
}
</script>

<template>
  <g-btn v-bind="$attrs" v-on="$listeners">
    <template #icon="{ attrs }">
      <g-icon-prev v-bind="attrs" />
    </template>
    <slot name="default"><span>前へ</span></slot>
  </g-btn>
</template>

<style></style>
