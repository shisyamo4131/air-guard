<script>
/**
 * 従業員休暇申請管理の一覧ページです。
 * @author shisyamo4131
 */
import GInputEmployeeLeaveApplication from '~/components/molecules/inputs/GInputEmployeeLeaveApplication.vue'
import GDataTableEmployeeLeaveApplications from '~/components/molecules/tables/GDataTableEmployeeLeaveApplications.vue'
import EmployeeLeaveApplication from '~/models/EmployeeLeaveApplication'
import GTextFieldMonth from '~/components/molecules/inputs/GTextFieldMonth.vue'
import GTemplateDocumentsIndex from '~/components/templates/GTemplateDocumentsIndex.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EmployeeLeaveApplicationsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputEmployeeLeaveApplication,
    GDataTableEmployeeLeaveApplications,
    GTextFieldMonth,
    GTemplateDocumentsIndex,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new EmployeeLeaveApplication(),
      items: [],
      month: this.$dayjs().format('YYYY-MM'),
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    filteredItems() {
      return this.items
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    month: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        const constraints = [['where', 'month', '==', newVal]]
        this.items = this.instance.subscribeDocs(constraints)
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
}
</script>

<template>
  <g-template-documents-index
    label="従業員休暇申請管理"
    :items="filteredItems"
    :instance="instance"
  >
    <template #input="{ attrs, on }">
      <g-input-employee-leave-application v-bind="attrs" tile v-on="on" />
    </template>
    <template #search>
      <g-text-field-month
        v-model="month"
        :options="{
          flat: true,
          outlined: false,
          soloInverted: true,
          hideDetails: true,
        }"
      />
      <v-spacer />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-employee-leave-applications v-bind="attrs" v-on="on" />
    </template>
  </g-template-documents-index>
</template>

<style></style>
