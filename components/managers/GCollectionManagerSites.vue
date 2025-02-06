<script>
/**
 * 現場コレクション管理コンポーネント
 * @author shisyamo4131
 * @refact 2025-02-06
 */
import GInputSite from '../molecules/inputs/GInputSite.vue'
import GCollectionManager from './GCollectionManager.vue'
import Site from '~/models/Site'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCollectionManager, GInputSite },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, default: '現場情報', required: false },
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
      <g-input-site v-bind="attrs" v-on="on" />
    </template>
  </g-collection-manager>
</template>

<style></style>
