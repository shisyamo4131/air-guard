<script>
/**
 * エラー表示を行うための Alert コンポーネントです。
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * エラーオブジェクトを受け取ります。
     */
    value: { type: Object, required: true },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    message() {
      return this.value?.message || null
    },
  },
}
</script>

<template>
  <v-alert v-bind="$attrs" type="error" v-on="$listeners">
    {{ message }}
  </v-alert>
</template>

<style></style>
