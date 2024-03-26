<script>
/**
 * ### GBtnDelete
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    color: { type: String, default: 'error', required: false },
  },
}
</script>

<template>
  <v-btn v-bind="$attrs" :color="color" v-on="$listeners">
    <slot name="default"> 削除 </slot>
  </v-btn>
</template>

<style></style>
