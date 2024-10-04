<script>
/**
 * ## GChipEmployeeStatus
 *
 * - 従業員の状態を表すChipコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-04 - 初版作成
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
      if (this.value === 'active') return '在職中'
      return '退職'
    },
  },
}
</script>

<template>
  <v-chip v-bind="$attrs" v-on="$listeners">
    {{ label }}
  </v-chip>
</template>

<style></style>
