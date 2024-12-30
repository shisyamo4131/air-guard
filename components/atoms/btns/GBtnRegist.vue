<script>
/**
 * 追加（登録）ボタンコンポーネントです。
 *
 * @author shisyamo4131
 */
import GIconRegist from '../icons/GIconRegist.vue'
import GBtn from './GBtn.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtn, GIconRegist },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * ボタンのラベルです。
     */
    label: { type: String, default: '登録', required: false },
  },
}
</script>

<template>
  <g-btn v-bind="{ ...$props, ...$attrs }" v-on="$listeners">
    <template #icon="{ attrs }">
      <g-icon-regist v-bind="attrs" />
    </template>
    <span>{{ label }}</span>
  </g-btn>
</template>

<style></style>
