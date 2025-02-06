<script>
/**
 * 取引先コレクション管理コンポーネント
 * @author shisyamo4131
 * @refact 2025-02-06
 */
import GInputCustomer from '../molecules/inputs/GInputCustomer.vue'
import GCollectionManager from './GCollectionManager.vue'
import Customer from '~/models/Customer'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCollectionManager, GInputCustomer },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, default: '取引先情報', required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new Customer(),
    }
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
      <g-input-customer v-bind="attrs" v-on="on" />
    </template>
  </g-collection-manager>
</template>

<style></style>
