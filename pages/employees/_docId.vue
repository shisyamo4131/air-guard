<script>
/**
 * 従業員の詳細画面です。
 * @author shisyamo4131
 */
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
import GCardEmployee from '~/components/molecules/cards/GCardEmployee.vue'
import GTemplateDetail from '~/components/templates/GTemplateDetail.vue'
import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
import GEmployeeContractsManager from '~/components/organisms/GEmployeeContractsManager.vue'
import Employee from '~/models/Employee'
import EmployeeMedicalCheckup from '~/models/EmployeeMedicalCheckup'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import GInputSecurityRegistration from '~/components/molecules/inputs/GInputSecurityRegistration.vue'
import GBtnEditIcon from '~/components/atoms/btns/GBtnEditIcon.vue'
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
    GInputSecurityRegistration,
    GBtnEditIcon,
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
      <v-col v-if="$store.getters['auth/isAdmin']" cols="12" lg="6">
        <g-employee-contracts-manager
          height="100%"
          :employee-id="listeners.employee.docId"
        />
      </v-col>
      <v-col cols="12" lg="6">
        <v-card height="100%">
          <v-card-title class="g-card__title justify-space-between">
            <div>警備員登録情報</div>
            <g-dialog-input>
              <template #activator="{ attrs, on }">
                <g-btn-edit-icon v-bind="attrs" color="primary" v-on="on" />
              </template>
              <template #default="{ attrs, on }">
                <g-input-security-registration
                  v-bind="attrs"
                  edit-mode="UPDATE"
                  :instance="listeners.employee"
                  v-on="on"
                />
              </template>
            </g-dialog-input>
          </v-card-title>
          <v-card-text v-if="!listeners.employee.hasSecurityRegistration">
            <v-alert class="mb-0" type="info" text>
              警備員登録はありません。
            </v-alert>
          </v-card-text>
          <v-simple-table v-else>
            <tbody>
              <tr>
                <td>警備員登録日</td>
                <td style="text-align: right">
                  {{ listeners.employee.securityRegistration.registrationDate }}
                </td>
              </tr>
              <tr>
                <td>警備経験開始日</td>
                <td style="text-align: right">
                  {{
                    listeners.employee.securityRegistration.securityStartDate
                  }}
                </td>
              </tr>
              <tr>
                <td>ブランク</td>
                <td style="text-align: right">
                  {{
                    `${listeners.employee.securityRegistration.blankMonths} ヶ月`
                  }}
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card>
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
