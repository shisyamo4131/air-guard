<script>
/**
 * ### GIconDelete
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    // color: { type: String, default: 'red', required: false },
  },
}
</script>

<template>
  <v-icon v-bind="{ ...$props, ...$attrs }" v-on="$listeners"
    >mdi-delete</v-icon
  >
</template>

<style></style>
