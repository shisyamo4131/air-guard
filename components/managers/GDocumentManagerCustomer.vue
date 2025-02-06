<script>
/**
 * 取引先ドキュメント管理のためのラッパーコンポーネント
 * @author shisyamo4131
 * @refact 2025-02-06
 */
import GInputCustomer from '../molecules/inputs/GInputCustomer.vue'
import GDocumentManager from './GDocumentManager.vue'
import Customer from '~/models/Customer'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GInputCustomer, GDocumentManager },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, default: '取引先情報編集', required: false },
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
  <g-document-manager
    v-bind="$attrs"
    :dialog-props="{ maxWidth: 600 }"
    :instance="instance"
    :label="label"
    v-on="$listeners"
  >
    <template #default="props">
      <slot name="default" v-bind="props" />
    </template>
    <template #inputs="{ attrs, on }">
      <g-input-customer v-bind="attrs" v-on="on" />
    </template>
  </g-document-manager>
</template>

<style></style>
