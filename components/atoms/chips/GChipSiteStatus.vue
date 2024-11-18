<script>
/**
 * - 現場の状態を表すChipコンポーネントです。
 *
 * @author shisyamo4131
 */

export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    value: {
      type: String,
      validator: (v) => ['active', 'expired'].includes(v),
      required: true,
    },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    label() {
      if (!this.value) return 'undefined'
      if (this.value === 'active') return '稼働中'
      return '終了'
    },
    data() {
      return this.value === 'active'
        ? { text: '稼働中', color: 'primary' }
        : { text: '終了', color: undefined }
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
