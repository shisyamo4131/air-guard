<script>
/**
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-14 - 初版作成
 */

export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    value: {
      type: String,
      default: 'undefined',
      validator: (v) =>
        [
          'scheduled',
          'non-statutory-holiday',
          'legal-holiday',
          'undefined',
        ].includes(v),
      required: false,
    },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    color() {
      return this.$DAY_TYPE[this.value]?.color || undefined
    },
    label() {
      return this.$DAY_TYPE[this.value] || 'error'
    },
  },
}
</script>

<template>
  <v-chip v-bind="$attrs" :color="color" dark v-on="$listeners">{{
    label
  }}</v-chip>
</template>

<style></style>
