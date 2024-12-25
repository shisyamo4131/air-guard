<script>
/**
 * 外注先情報の一覧ページです。
 * @author shisyamo4131
 */
import GInputOutsourcer from '~/components/molecules/inputs/GInputOutsourcer.vue'
import GDataTableOutsourcers from '~/components/molecules/tables/GDataTableOutsourcers.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import Outsourcer from '~/models/Outsourcer'
import GTemplateDocumentsIndex from '~/components/templates/GTemplateDocumentsIndex.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'OutsourcersIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputOutsourcer,
    GDataTableOutsourcers,
    GSwitch,
    GTemplateDocumentsIndex,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new Outsourcer(),
      includeExpired: false,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.getters['outsourcers/items'].filter(({ status }) => {
        return this.includeExpired || status === 'active'
      })
    },
  },
}
</script>

<template>
  <g-template-documents-index
    label="外注先管理"
    :items="items"
    :instance="instance"
  >
    <template #input="{ attrs, on }">
      <g-input-outsourcer v-bind="attrs" v-on="on" />
    </template>
    <template #nav>
      <g-switch v-model="includeExpired" label="取引終了を含める" />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-outsourcers
        v-bind="attrs"
        sort-by="code"
        sort-desc
        v-on="on"
      />
    </template>
  </g-template-documents-index>
</template>

<style></style>
