<script>
/**
 * 現場取極めコレクション管理のためのラッパーコンポーネント
 * @author shisyamo4131
 * @refact 2025-02-07
 */
import GInputSiteContract from '../molecules/inputs/GInputSiteContract.vue'
import GCollectionManager from './GCollectionManager.vue'
import SiteContract from '~/models/SiteContract'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCollectionManager,
    GInputSiteContract,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, default: '現場取極め情報', required: false },
    instance: {
      type: Object,
      default: () => new SiteContract(),
      required: false,
      validator: (v) => v instanceof SiteContract,
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
      <g-input-site-contract v-bind="attrs" v-on="on" />
    </template>
  </g-collection-manager>
</template>

<style></style>
