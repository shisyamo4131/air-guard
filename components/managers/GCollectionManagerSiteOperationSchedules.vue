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
      default: new SiteOperationSchedule(),
      required: false,
      validator: (v) => v instanceof SiteOperationSchedule,
    },
  },
}
</script>

<template>
  <g-collection-manager
    v-bind="$attrs"
    :dialog-props="{ maxWidth: 480 }"
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
