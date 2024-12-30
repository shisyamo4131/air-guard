<script>
/**
 * 絞り込みボタンコンポーネントです。
 *
 * @author shisyamo4131
 */
import GIconFilter from '../icons/GIconFilter.vue'
import GBtn from './GBtn.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtn, GIconFilter },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * ボタンのラベルです。
     */
    label: { type: String, default: '絞り込み', required: false },
  },
}
</script>

<template>
  <g-btn v-bind="{ ...$props, ...$attrs }" v-on="$listeners">
    <template #icon="{ attrs }">
      <g-icon-filter v-bind="attrs" />
    </template>
    <span>{{ label }}</span>
  </g-btn>
</template>

<style></style>
