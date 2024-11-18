<script>
/**
 * ### pages.EmployeeDetail
 *
 * 従業員の詳細画面です。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-09-12 - 初版作成
 *
 */
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
import GCardEmployee from '~/components/molecules/cards/GCardEmployee.vue'
import GTemplateDetail from '~/components/templates/GTemplateDetail.vue'
import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
import GEmployeeContractsManager from '~/components/organisms/GEmployeeContractsManager.vue'
import Employee from '~/models/Employee'
import EmployeeMedicalCheckup from '~/models/EmployeeMedicalCheckup'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GEditModeMixin from '~/mixins/GEditModeMixin'
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
    GEmployeeContractsManager,
    GDialogInput,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GEditModeMixin],
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
      <v-col cols="12">
        <g-employee-contracts-manager :instance="listeners.employee" />
      </v-col>
      <v-col cols="12" md="5">
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
    <g-dialog-input v-model="dialog" @submit:complete="onSubmitComplete">
      <template #default="{ attrs, on }">
        <g-input-employee
          v-bind="attrs"
          :edit-mode="UPDATE"
          :instance="listeners.employee"
          v-on="on"
        />
      </template>
    </g-dialog-input>
  </g-template-detail>
</template>

<style></style>
