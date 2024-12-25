<script>
/**
 * 手当マスタの一覧ページです。
 * @author shisyamo4131
 */
import GInputAllowance from '~/components/molecules/inputs/GInputAllowance.vue'
import GDataTableAllowances from '~/components/molecules/tables/GDataTableAllowances.vue'
import Allowance from '~/models/Allowance'
import GTemplateDocumentsIndex from '~/components/templates/GTemplateDocumentsIndex.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'AllowancesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputAllowance,
    GDataTableAllowances,
    GTemplateDocumentsIndex,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new Allowance(),
      includeExpired: false,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.getters['allowances/items']
    },
  },
}
</script>

<template>
  <g-template-documents-index
    label="手当マスタ管理"
    :items="items"
    :instance="instance"
  >
    <template #input="{ attrs, on }">
      <g-input-allowance v-bind="attrs" v-on="on" />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-allowances v-bind="attrs" v-on="on" />
    </template>
  </g-template-documents-index>
</template>

<style></style>
