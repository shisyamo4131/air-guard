<script>
/**
 * エラー表示を行うためのスナックバーコンポーネントです。
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    message: { type: String, default: undefined, required: false },
    value: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    initialize() {
      this.$emit('input', false)
      this.$emit('update:message', null)
    },
  },
}
</script>

<template>
  <v-snackbar v-bind="$attrs" :value="value" color="error" v-on="$listeners">
    <slot v-bind="{ message }">
      {{ message }}
    </slot>
    <template #action="{ attrs }">
      <slot name="action" v-bind="{ attrs }" />
    </template>
  </v-snackbar>
</template>

<style></style>
