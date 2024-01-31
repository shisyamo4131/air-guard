<script>
import { limit, orderBy } from 'firebase/firestore'
import GInputAutonumber from '~/components/molecules/inputs/GInputAutonumber.vue'
import GDataTableAutonumbers from '~/components/molecules/tables/GDataTableAutonumbers.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
/**
 * ### pages.admin.autonumbers
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTableAutonumbers,
    GInputAutonumber,
    GTemplateIndex,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app }) {
    const model = app.$Autonumber()
    const defaultConstraints = [orderBy('updateAt', 'desc'), limit(10)]
    const items = model.subscribe(undefined, defaultConstraints)
    return { model, items, defaultConstraints }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {}
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.model.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {},
}
</script>

<template>
  <g-template-index
    label="自動採番管理"
    action-type="edit-delete"
    :dialog-props="{ width: 600 }"
    :items="model.items"
    :model="model"
  >
    <template #input="{ attrs, on }">
      <g-input-autonumber v-bind="attrs" v-on="on" />
    </template>
    <template #data-table="{ attrs, on }">
      <g-data-table-autonumbers v-bind="attrs" v-on="on" />
    </template>
  </g-template-index>
</template>

<style></style>
