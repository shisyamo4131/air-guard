<script>
/**
 * ### GBtnCancelIcon
 * @author shisyamo4131
 */
import GIconCancel from '~/components/atoms/icons/GIconCancel.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GIconCancel },
}
</script>

<template>
  <v-btn v-bind="$attrs" icon v-on="$listeners">
    <g-icon-cancel />
  </v-btn>
</template>

<style></style>
