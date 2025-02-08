<script>
/**
 * 外注先コレクション管理のためのラッパーコンポーネント
 * @author shisyamo4131
 * @refact 2025-02-08
 */
import GInputOutsourcer from '../molecules/inputs/GInputOutsourcer.vue'
import GCollectionManager from './GCollectionManager.vue'
import Outsourcer from '~/models/Outsourcer'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCollectionManager, GInputOutsourcer },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, default: '外注先情報', required: false },
    instance: {
      type: Object,
      default: () => new Outsourcer(),
      required: false,
      validator: (v) => v instanceof Outsourcer,
    },
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
      <g-input-outsourcer v-bind="attrs" v-on="on" />
    </template>
  </g-collection-manager>
</template>

<style></style>
