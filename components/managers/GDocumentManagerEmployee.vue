<script>
/**
 * 従業員ドキュメント管理のためのラッパーコンポーネント
 * @author shisyamo4131
 * @refact 2025-02-10
 */
import GInputEmployee from '../molecules/inputs/GInputEmployee.vue'
import GDocumentManager from './GDocumentManager.vue'
import Employee from '~/models/Employee'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GInputEmployee, GDocumentManager },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, default: '従業員情報編集', required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new Employee(),
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
      <g-input-employee v-bind="attrs" v-on="on" />
    </template>
  </g-document-manager>
</template>

<style></style>
