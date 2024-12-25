<script>
/**
 * 自動採番の一覧ページです。
 * @author shisyamo4131
 */
import GInputAutonumber from '~/components/molecules/inputs/GInputAutonumber.vue'
import Autonumber from '~/models/Autonumber'
import GDataTableAutonumbers from '~/components/molecules/tables/GDataTableAutonumbers.vue'
import GTemplateDocumentsIndex from '~/components/templates/GTemplateDocumentsIndex.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'AutonumbersIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputAutonumber,
    GDataTableAutonumbers,
    GTemplateDocumentsIndex,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new Autonumber(),
      items: [],
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {},

  /***************************************************************************
   * MOUNTED
   ***************************************************************************/
  mounted() {
    this.items = this.instance.subscribeDocs()
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.instance.unsubscribe()
  },
}
</script>

<template>
  <g-template-documents-index
    label="自動採番管理"
    :dialog-props="{ maxWidth: 360 }"
    :items="items"
    :instance="instance"
  >
    <template #input="{ attrs, on }">
      <g-input-autonumber v-bind="attrs" v-on="on" />
    </template>

    <template #default="{ attrs, on }">
      <g-data-table-autonumbers v-bind="attrs" v-on="on" />
    </template>
  </g-template-documents-index>
</template>

<style></style>
