<script>
/**
 * フィルタアイコンボタンを提供するコンポーネントです。
 * @author shisyamo4131
 */
import GIconFilter from '../icons/GIconFilter.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GIconFilter },
}
</script>

<template>
  <v-btn v-bind="$attrs" icon v-on="$listeners">
    <g-icon-filter />
  </v-btn>
</template>

<style></style>
