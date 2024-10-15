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
    short: { type: Boolean, default: false, required: false },
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
      if (this.short) {
        return this.$DAY_TYPE[this.value].short || 'error'
      } else {
        return this.$DAY_TYPE[this.value] || 'error'
      }
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
