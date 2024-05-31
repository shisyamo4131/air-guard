<script>
/**
 * ### GIconEdit
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    // color: { type: String, default: 'green', required: false },
  },
}
</script>

<template>
  <v-icon v-bind="{ ...$props, ...$attrs }" v-on="$listeners"
    >mdi-pencil</v-icon
  >
</template>

<style></style>
