<script>
/**
 * 絞り込みボタンコンポーネントです。
 * @author shisyamo4131
 *
 * @refact 2025-01-09
 */
import GIconFilter from '../icons/GIconFilter.vue'
import GBtn from './GBtn.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtn, GIconFilter },
}
</script>

<template>
  <g-btn v-bind="$attrs" v-on="$listeners">
    <template #icon="{ attrs }">
      <g-icon-filter v-bind="attrs" />
    </template>
    <slot name="default"><span>絞り込み</span></slot>
  </g-btn>
</template>

<style></style>
