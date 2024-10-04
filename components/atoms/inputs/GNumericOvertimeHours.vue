<script>
/**
 * ## GNumericOvertimeMinutes
 *
 * 残業時間（分単位）入力用コンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-04 - 初版作成
 */
import GNumeric from './GNumeric.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GNumeric },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, default: '残業時間', required: false },
    suffix: { type: String, default: '時間', required: false },
    value: { type: Number, default: null, required: false },
  },
}
</script>

<template>
  <g-numeric
    v-bind="{ ...$attrs, ...$props }"
    class="right-input"
    decimal-places="2"
    v-on="$listeners"
  />
</template>

<style></style>
