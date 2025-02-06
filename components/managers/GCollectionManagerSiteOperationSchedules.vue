<script>
/**
 * 現場稼働予定コレクション管理のためのラッパーコンポーネント
 * @author shisyamo4131
 * @refact 2025-02-06
 */
import GInputSiteOperationSchedule from '../molecules/inputs/GInputSiteOperationSchedule.vue'
import GCollectionManager from './GCollectionManager.vue'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCollectionManager,
    GInputSiteOperationSchedule,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, default: '現場稼働予定情報', required: false },
    instance: {
      type: Object,
      default: () => new SiteOperationSchedule(),
      required: false,
      validator: (v) => v instanceof SiteOperationSchedule,
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /*******************************************
     * AirArrayManager のメソッドを提供
     *******************************************/
    async toRegist() {
      await this.$refs.manager.toRegist()
    },
    async toUpdate(item) {
      await this.$refs.manager.toUpdate(item)
    },
    async toDelete(item) {
      await this.$refs.manager.toDelete(item)
    },
  },
}
</script>

<template>
  <g-collection-manager
    ref="manager"
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
      <g-input-site-operation-schedule v-bind="attrs" v-on="on" />
    </template>
  </g-collection-manager>
</template>

<style></style>
