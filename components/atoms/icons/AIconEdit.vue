<script>
/**
 * ## AIconEdit
 * An icon for 'edit'.
 * All props of VIcon are available.
 * Default color is green.
 *
 * @author shisyamo4131
 * @create 2024-03-18
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    color: { type: String, default: 'green', required: false },
  },
}
</script>

<template>
  <v-icon v-bind="{ ...$props, ...$attrs }" v-on="$listeners"
    >mdi-pencil</v-icon
  >
</template>

<style></style>
