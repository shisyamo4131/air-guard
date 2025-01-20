<script>
/**
 * 取引先ドキュメント管理コンポーネント
 * @author shisyamo4131
 * @refact 2025-01-16
 */
import AirItemManager from '../air/AirItemManager.vue'
import GInputCustomer from '../molecules/inputs/GInputCustomer.vue'
import Customer from '~/models/Customer'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { AirItemManager, GInputCustomer },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    docId: { type: String, required: true },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new Customer(),
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    docId: {
      handler(v) {
        this.instance.subscribe(v)
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.instance.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async handleUpdate(item) {
      await item.update()
    },
    async handleDelete(item) {
      await item.delete()
    },
  },
}
</script>

<template>
  <air-item-manager
    :item="instance"
    :label="instance.abbr"
    :dialog-props="{ maxWidth: 600 }"
    :handle-update="handleUpdate"
    :handle-delete="handleDelete"
  >
    <template #default="props">
      <slot name="default" v-bind="props" />
    </template>
    <template #inputs="{ attrs, on }">
      <g-input-customer v-bind="attrs" v-on="on" />
    </template>
  </air-item-manager>
</template>

<style></style>
