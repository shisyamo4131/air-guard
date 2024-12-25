<script>
import GDataTableHealthInsurances from '~/components/atoms/tables/GDataTableHealthInsurances.vue'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'
import GInputHealthInsurance from '~/components/molecules/inputs/GInputHealthInsurance.vue'
import GTemplateDocumentsIndex from '~/components/templates/GTemplateDocumentsIndex.vue'
import HealthInsurance from '~/models/HealthInsurance'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'HealthInsurancesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GAutocompleteEmployee,
    GInputHealthInsurance,
    GDataTableHealthInsurances,
    GTemplateDocumentsIndex,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      docs: [],
      instance: new HealthInsurance(),
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
     * 健康保険ドキュメントへの購読を開始します。
     */
    subscribe() {
      this.unsubscribe()
      this.docs = this.instance.subscribeDocs([
        ['where', 'isLossed', '==', false],
      ])
    },

    /**
     * 健康保険ドキュメントへの購読を解除します。
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
    label="健康保険管理"
    :items="docs"
    :instance="instance"
  >
    <template #input="{ attrs, on }">
      <g-input-health-insurance v-bind="attrs" v-on="on" />
    </template>
    <template #search="{ inputAttrs }">
      <g-autocomplete-employee
        v-model="selectedEmployeeId"
        v-bind="inputAttrs"
      />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-health-insurances v-bind="attrs" v-on="on">
      </g-data-table-health-insurances>
    </template>
  </g-template-documents-index>
</template>

<style></style>
