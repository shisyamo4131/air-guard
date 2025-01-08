<script>
/**
 * 次へボタンコンポーネントです。
 *
 * @author shisyamo4131
 */
import GIconNext from '../icons/GIconNext.vue'
import GBtn from './GBtn.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtn, GIconNext },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * ボタンのラベルです。
     */
    label: { type: String, default: '次へ', required: false },
  },
}
</script>

<template>
  <g-btn v-bind="{ ...$props, ...$attrs }" v-on="$listeners">
    <template #icon="{ attrs }">
      <g-icon-next v-bind="attrs" />
    </template>
    <span>{{ label }}</span>
  </g-btn>
</template>

<style></style>
