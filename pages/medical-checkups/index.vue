<script>
import GDataTableMedicalCheckups from '~/components/atoms/tables/GDataTableMedicalCheckups.vue'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'
import GInputMedicalCheckup from '~/components/molecules/inputs/GInputMedicalCheckup.vue'
import GTemplateDocumentsIndex from '~/components/templates/GTemplateDocumentsIndex.vue'
import MedicalCheckup from '~/models/MedicalCheckup'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'MedicalCheckupsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GAutocompleteEmployee,
    GInputMedicalCheckup,
    GDataTableMedicalCheckups,
    GTemplateDocumentsIndex,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      docs: [],
      instance: new MedicalCheckup(),
      selectedEmployeeId: null,
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    selectedEmployeeId: {
      handler(v) {
        this.subscribe()
      },
      immediate: true,
    },
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
     * 健康診断ドキュメントへの購読を開始します。
     */
    subscribe() {
      this.unsubscribe()
      if (!this.selectedEmployeeId) return
      this.docs = this.instance.subscribeDocs([
        ['where', 'employeeId', '==', this.selectedEmployeeId],
      ])
    },

    /**
     * 健康診断ドキュメントへの購読を解除します。
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
    label="健康診断管理"
    :items="docs"
    :instance="instance"
  >
    <template #input="{ attrs, on }">
      <g-input-medical-checkup v-bind="attrs" v-on="on" />
    </template>
    <template #search="{ attrs }">
      <g-autocomplete-employee v-bind="attrs" v-model="selectedEmployeeId" />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-medical-checkups v-bind="attrs" v-on="on" />
    </template>
  </g-template-documents-index>
</template>

<style></style>
