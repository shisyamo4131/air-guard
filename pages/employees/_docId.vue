<script>
/**
 * 従業員の詳細画面です。
 * @author shisyamo4131
 */
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
import GCardEmployee from '~/components/molecules/cards/GCardEmployee.vue'
import GTemplateDetail from '~/components/templates/GTemplateDetail.vue'
import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
import Employee from '~/models/Employee'
import EmployeeMedicalCheckup from '~/models/EmployeeMedicalCheckup'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import GCardEmployeeSecurityRegistration from '~/components/molecules/cards/GCardEmployeeSecurityRegistration.vue'
import GCardEmployeeContracts from '~/components/molecules/cards/GCardEmployeeContracts.vue'
import GCardEmployeeHealthInsurance from '~/components/molecules/cards/GCardEmployeeHealthInsurance.vue'
import GCardEmployeePension from '~/components/molecules/cards/GCardEmployeePension.vue'
import GCardEmployeeEmploymentInsurance from '~/components/molecules/cards/GCardEmployeeEmploymentInsurance.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EmployeeDetail',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCardMap,
    GCardEmployee,
    GTemplateDetail,
    GInputEmployee,
    GDialogInput,
    GCardEmployeeSecurityRegistration,
    GCardEmployeeContracts,
    GCardEmployeeHealthInsurance,
    GCardEmployeePension,
    GCardEmployeeEmploymentInsurance,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeProvider],

  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app, route }) {
    const docId = route.params.docId
    const items = {
      medicalCheckups: [],
    }
    const listeners = {
      employee: new Employee(),
      medicalCheckup: new EmployeeMedicalCheckup(),
    }
    listeners.employee.subscribe(docId)
    items.medicalCheckups = listeners.medicalCheckup.subscribeDocs()
    return { docId, listeners, items }
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    parentPath() {
      return this.$route.path.split('/').slice(0, -1).join('/')
    },
    breadcrumbs() {
      return [
        { text: 'TOP', to: '/' },
        { text: '従業員', to: this.parentPath, exact: true },
        { text: '従業員詳細', to: `${this.parentPath}/${this.docId}` },
      ]
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    Object.keys(this.listeners).forEach((key) => {
      this.listeners[key].unsubscribe()
    })
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickEdit() {
      this.editMode = this.UPDATE
      this.dialog = true
    },
    onSubmitComplete(event) {
      if (event.editMode === 'DELETE') {
        this.$router.replace(this.parentPath)
      }
    },
  },
}
</script>

<template>
  <g-template-detail
    :actions="[{ event: 'edit', icon: 'mdi-pencil', color: 'green' }]"
    @click:edit="onClickEdit"
  >
    <v-breadcrumbs :items="breadcrumbs" />
    <v-row>
      <v-col cols="12">
        <g-card-employee
          :instance="listeners.employee"
          outlined
          :medical-checkups="items.medicalCheckups"
        />
      </v-col>
      <v-col cols="12" md="4">
        <g-card-employee-health-insurance
          :employee-id="listeners.employee.docId"
          :color="$FUTURE_COLOR_INDEX(0)"
        />
      </v-col>
      <v-col cols="12" md="4">
        <g-card-employee-pension
          :employee-id="listeners.employee.docId"
          :color="$FUTURE_COLOR_INDEX(1)"
        />
      </v-col>
      <v-col cols="12" md="4">
        <g-card-employee-employment-insurance
          :employee-id="listeners.employee.docId"
          :color="$FUTURE_COLOR_INDEX(2)"
        />
      </v-col>
      <v-col v-if="$store.getters['auth/isAdmin']" cols="12" lg="6">
        <g-card-employee-contracts
          :employee-id="listeners.employee.docId"
          height="100%"
          :color="$FUTURE_COLOR_INDEX(3)"
        />
      </v-col>
      <v-col cols="12" lg="6">
        <g-card-employee-security-registration
          height="100%"
          :doc-id="docId"
          :color="$FUTURE_COLOR_INDEX(4)"
        />
      </v-col>
      <v-col cols="12">
        <g-card-map
          :value="listeners.employee.address1"
          outlined
          height="612"
        />
      </v-col>
      <v-col cols="12" md="7">
        <!-- <g-leave-application-calendar
          :employee-id="docId"
          outlined
          height="612"
        /> -->
      </v-col>
    </v-row>
    <!-- editor -->
    <g-dialog-input
      v-model="dialog"
      :edit-mode.sync="editMode"
      :instance="listeners.employee"
      @submit:complete="onSubmitComplete"
    >
      <template #default="{ attrs, on }">
        <g-input-employee v-bind="attrs" v-on="on" />
      </template>
    </g-dialog-input>
  </g-template-detail>
</template>

<style></style>
