<script>
import GDataTableEmploymentInsurances from '~/components/atoms/tables/GDataTableEmploymentInsurances.vue'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'
import GInputEmploymentInsurance from '~/components/molecules/inputs/GInputEmploymentInsurance.vue'
import GTemplateDocumentsIndex from '~/components/templates/GTemplateDocumentsIndex.vue'
import EmploymentInsurance from '~/models/EmploymentInsurance'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EmploymentInsurancesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GAutocompleteEmployee,
    GInputEmploymentInsurance,
    GDataTableEmploymentInsurances,
    GTemplateDocumentsIndex,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      docs: [],
      instance: new EmploymentInsurance(),
      selectedEmployeeId: null,
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    selectedEmployeeId(v) {
      this.subscribe()
    },
  },

  /***************************************************************************
   * MOUNTED
   ***************************************************************************/
  mounted() {
    this.subscribe()
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 雇用保険ドキュメントへの購読を開始します。
     */
    subscribe() {
      this.unsubscribe()
      this.docs = this.instance.subscribeDocs([
        ['where', 'isLossed', '==', false],
      ])
    },

    /**
     * 雇用保険ドキュメントへの購読を解除します。
     */
    unsubscribe() {
      this.docs.splice(0)
      this.instance.unsubscribe()
    },
  },
}
</script>

<template>
  <g-template-documents-index
    label="雇用保険管理"
    :items="docs"
    :instance="instance"
  >
    <template #input="{ attrs, on }">
      <g-input-employment-insurance v-bind="attrs" v-on="on" />
    </template>
    <template #search="{ inputAttrs }">
      <g-autocomplete-employee
        v-model="selectedEmployeeId"
        v-bind="inputAttrs"
      />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-employment-insurances v-bind="attrs" v-on="on" />
    </template>
  </g-template-documents-index>
</template>

<style></style>
