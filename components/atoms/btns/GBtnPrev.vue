<script>
/**
 * 前へボタンコンポーネントです。
 *
 * @author shisyamo4131
 */
import GIconPrev from '../icons/GIconPrev.vue'
import GBtn from './GBtn.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtn, GIconPrev },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * ボタンのラベルです。
     */
    label: { type: String, default: '前へ', required: false },
  },
}
</script>

<template>
  <g-btn v-bind="{ ...$props, ...$attrs }" v-on="$listeners">
    <template #icon="{ attrs }">
      <g-icon-prev v-bind="attrs" />
    </template>
    <span>{{ label }}</span>
  </g-btn>
</template>

<style></style>
