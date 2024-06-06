<script>
/**
 * ### GBtnSubmitIcon
 * @author shisyamo4131
 */
import GIconSubmit from '~/components/atoms/icons/GIconSubmit.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GIconSubmit },
}
</script>

<template>
  <v-btn v-bind="$attrs" icon v-on="$listeners">
    <g-icon-submit />
  </v-btn>
</template>

<style></style>
