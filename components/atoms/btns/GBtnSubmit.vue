<script>
/**
 * 確定ボタンコンポーネントです。
 *
 * @author shisyamo4131
 */
import GIconSubmit from '../icons/GIconSubmit.vue'
import GBtn from './GBtn.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtn, GIconSubmit },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * ボタンのラベルです。
     */
    label: { type: String, default: '確定', required: false },
  },
}
</script>

<template>
  <g-btn v-bind="{ ...$props, ...$attrs }" v-on="$listeners">
    <template #icon="{ attrs }">
      <g-icon-submit v-bind="attrs" />
    </template>
    <span>{{ label }}</span>
  </g-btn>
</template>

<style></style>
