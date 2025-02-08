<script>
/**
 * 従業員コレクション管理のためのラッパーコンポーネント
 * @author shisyamo4131
 * @refact 2025-02-08
 */
import GInputEmployee from '../molecules/inputs/GInputEmployee.vue'
import GCollectionManager from './GCollectionManager.vue'
import Employee from '~/models/Employee'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCollectionManager, GInputEmployee },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, default: '従業員情報', required: false },
    instance: {
      type: Object,
      default: () => new Employee(),
      required: false,
      validator: (v) => v instanceof Employee,
    },
  },
}
</script>

<template>
  <g-collection-manager
    v-bind="$attrs"
    :dialog-props="{ maxWidth: 600 }"
    :label="label"
    :instance="instance"
    v-on="$listeners"
  >
    <template #default="props">
      <slot name="default" v-bind="props" />
    </template>
    <template #inputs="{ attrs, on }">
      <g-input-employee v-bind="attrs" v-on="on" />
    </template>
  </g-collection-manager>
</template>

<style></style>
