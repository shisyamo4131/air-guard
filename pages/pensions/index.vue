<script>
import GDataTablePensions from '~/components/atoms/tables/GDataTablePensions.vue'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'
import GInputPension from '~/components/molecules/inputs/GInputPension.vue'
import GTemplateDocumentsIndex from '~/components/templates/GTemplateDocumentsIndex.vue'
import Pension from '~/models/Pension'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'PensionsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GAutocompleteEmployee,
    GInputPension,
    GDataTablePensions,
    GTemplateDocumentsIndex,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      docs: [],
      instance: new Pension(),
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
     * 厚生年金ドキュメントへの購読を開始します。
     */
    subscribe() {
      this.unsubscribe()
      this.docs = this.instance.subscribeDocs([
        ['where', 'isLossed', '==', false],
      ])
    },

    /**
     * 厚生年金ドキュメントへの購読を解除します。
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
    label="厚生年金管理"
    :items="docs"
    :instance="instance"
  >
    <template #input="{ attrs, on }">
      <g-input-pension v-bind="attrs" v-on="on" />
    </template>
    <template #search="{ inputAttrs }">
      <g-autocomplete-employee
        v-model="selectedEmployeeId"
        v-bind="inputAttrs"
      />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-pensions v-bind="attrs" v-on="on" />
    </template>
  </g-template-documents-index>
</template>

<style></style>
