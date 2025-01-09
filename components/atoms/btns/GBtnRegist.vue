<script>
/**
 * 追加（登録）ボタンコンポーネントです。
 * @author shisyamo4131
 *
 * @refact 2025-01-09
 */
import GIconRegist from '../icons/GIconRegist.vue'
import GBtn from './GBtn.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtn, GIconRegist },
}
</script>

<template>
  <g-btn v-bind="$attrs" v-on="$listeners">
    <template #icon="{ attrs }">
      <g-icon-regist v-bind="attrs" />
    </template>
    <slot name="default"><span>登録</span></slot>
  </g-btn>
</template>

<style></style>
