<script>
/**
 * 従業員情報の一覧ページです。
 * @author shisyamo4131
 */
import GDataTableEmployees from '~/components/molecules/tables/GDataTableEmployees.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
import Employee from '~/models/Employee'
import GTemplateDocumentsIndex from '~/components/templates/GTemplateDocumentsIndex.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EmployeesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTableEmployees,
    GSwitch,
    GInputEmployee,
    GTemplateDocumentsIndex,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new Employee(),
      includeExpired: false,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.getters['employees/items'].filter(({ status }) => {
        return this.includeExpired || status === 'active'
      })
    },
  },
}
</script>

<template>
  <g-template-documents-index
    label="従業員管理"
    :items="items"
    :instance="instance"
  >
    <template #input="{ attrs, on }">
      <g-input-employee v-bind="attrs" v-on="on" />
    </template>
    <template #nav>
      <g-switch v-model="includeExpired" hide-details label="退職者を含める" />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-employees v-bind="attrs" v-on="on" />
    </template>
  </g-template-documents-index>
</template>

<style></style>
