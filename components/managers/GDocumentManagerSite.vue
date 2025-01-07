<script>
/**
 * 現場管理コンポーネントです。
 * @author shisyamo4131
 */
import GInputSite from '../molecules/inputs/GInputSite.vue'
import GDocumentManager from './GDocumentManager.vue'
import Site from '~/models/Site'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDocumentManager, GInputSite },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 管理対象のドキュメントIDです。
     */
    docId: { type: String, required: true },
  },

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
  <g-document-manager :doc-id="docId" :instance="instance">
    <template #default="props">
      <slot name="default" v-bind="props" />
    </template>
    <template #editor="{ attrs, on }">
      <g-input-site v-bind="attrs" v-on="on" />
    </template>
  </g-document-manager>
</template>

<style></style>
