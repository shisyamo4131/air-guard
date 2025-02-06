<script>
/**
 * 現場ドキュメント管理コンポーネント
 * @author shisyamo4131
 * @refact 2025-02-06
 */
import GInputSite from '../molecules/inputs/GInputSite.vue'
import GDocumentManager from './GDocumentManager.vue'
import Site from '~/models/Site'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GInputSite, GDocumentManager },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new Site(),
    }
  },
}
</script>

<template>
  <g-document-manager
    v-bind="$attrs"
    :instance="instance"
    :dialog-props="{ maxWidth: 600 }"
    v-on="$listeners"
  >
    <template #default="props">
      <slot name="default" v-bind="props" />
    </template>
    <template #inputs="{ attrs, on }">
      <g-input-site v-bind="attrs" v-on="on" />
    </template>
  </g-document-manager>
</template>

<style></style>
