<script>
/**
 * 次へボタンコンポーネントです。
 * @author shisyamo4131
 *
 * @refact 2025-01-09
 */
import GIconNext from '../icons/GIconNext.vue'
import GBtn from './GBtn.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtn, GIconNext },
}
</script>

<template>
  <g-btn v-bind="$attrs" v-on="$listeners">
    <template #icon="{ attrs }">
      <g-icon-next v-bind="attrs" />
    </template>
    <slot name="default"><span>次へ</span></slot>
  </g-btn>
</template>

<style></style>
