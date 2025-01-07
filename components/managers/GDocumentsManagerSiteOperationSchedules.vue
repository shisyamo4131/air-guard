<script>
/**
 * 現場稼働予定管理コンポーネントです。
 * @author shisyamo4131
 */
import GInputSiteOperationSchedule from '../molecules/inputs/GInputSiteOperationSchedule.vue'
import GDocumentsManager from './GDocumentsManager.vue'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDocumentsManager, GInputSiteOperationSchedule },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 稼働予定管理対象の現場IDです。
     */
    siteId: { type: String, required: true },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      docs: [],
      instance: new SiteOperationSchedule(),
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    siteId: {
      handler(v) {
        if (v) this.instance = new SiteOperationSchedule({ siteId: v })
        this.subscribe()
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    subscribe() {
      this.docs = []
      if (!this.siteId) return
      this.docs = this.instance.subscribeDocs([
        ['where', 'siteId', '==', this.siteId],
      ])
    },

    unsubscribe() {
      this.instance.unsubscribe()
    },
  },
}
</script>

<template>
  <g-documents-manager :docs="docs" :instance="instance">
    <template #default="props">
      <slot name="default" v-bind="props" />
    </template>
    <template #editor="{ attrs, on }">
      <g-input-site-operation-schedule v-bind="attrs" v-on="on" />
    </template>
  </g-documents-manager>
</template>

<style></style>
