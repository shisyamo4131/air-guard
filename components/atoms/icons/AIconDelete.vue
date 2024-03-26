<script>
/**
 * ## AIconDelete
 * An icon for 'delete'.
 * All props of VIcon are available.
 * Default color is red.
 *
 * @author shisyamo4131
 * @create 2024-03-18
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    color: { type: String, default: 'red', required: false },
  },
}
</script>

<template>
  <v-icon v-bind="{ ...$props, ...$attrs }" v-on="$listeners"
    >mdi-delete</v-icon
  >
</template>

<style></style>
