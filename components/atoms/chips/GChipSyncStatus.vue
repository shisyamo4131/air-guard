<script>
/**
 * 取引先, 現場, 従業員マスタが同期されているかどうかを表すためのチップコンポーネントです。
 *
 * @author shisyamo4131
 */

export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    value: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    data() {
      return this.value
        ? { text: '同期済', color: 'primary' }
        : { text: '未同期', color: undefined }
    },
  },
}
</script>

<template>
  <v-chip v-bind="$attrs" :color="data.color" v-on="$listeners">
    {{ data.text }}
  </v-chip>
</template>

<style></style>
