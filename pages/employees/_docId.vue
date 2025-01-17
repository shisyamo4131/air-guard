<script>
/**
 * 従業員の詳細画面です。
 * @author shisyamo4131
 */
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
import Employee from '~/models/Employee'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import GCardEmployeeSecurityRegistration from '~/components/molecules/cards/GCardEmployeeSecurityRegistration.vue'
import GCardEmployeeContracts from '~/components/molecules/cards/GCardEmployeeContracts.vue'
import GCardEmployeeHealthInsurance from '~/components/molecules/cards/GCardEmployeeHealthInsurance.vue'
import GCardEmployeePension from '~/components/molecules/cards/GCardEmployeePension.vue'
import GCardEmployeeEmploymentInsurance from '~/components/molecules/cards/GCardEmployeeEmploymentInsurance.vue'
import GCardEmployeeMedicalCheckups from '~/components/organisms/Cards/GCardEmployeeMedicalCheckups.vue'
import GManagerEmployee from '~/components/managers/GManagerEmployee.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GBtnEdit from '~/components/atoms/btns/GBtnEdit.vue'
import GImgEmployee from '~/components/molecules/images/GImgEmployee.vue'
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
    GCardEmployeeSecurityRegistration,
    GCardEmployeeContracts,
    GCardEmployeeHealthInsurance,
    GCardEmployeePension,
    GCardEmployeeEmploymentInsurance,
    GCardEmployeeMedicalCheckups,
    GManagerEmployee,
    GTemplateDefault,
    GBtnEdit,
    GImgEmployee,
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
    const listeners = {
      employee: new Employee(),
    }
    listeners.employee.subscribe(docId)
    return { docId, listeners }
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

    /**
     * メイン情報として表示する項目の配列です。
     */
    mainProps() {
      return [
        { text: 'CODE', value: 'code' },
        { text: '住所1', value: 'address1' },
        { text: '住所2', value: 'address2' },
        { text: '書類送付先', value: 'hasSendAddress' },
        { text: '携帯電話', value: 'mobile' },
        { text: '入社日', value: 'hireDate' },
        { text: '生年月日', value: 'birth' },
        { text: '性別', value: 'gender' },
        { text: '血液型', value: 'bloodType' },
      ]
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},

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
  methods: {},
}
</script>

<template>
  <g-template-default>
    <v-breadcrumbs :items="breadcrumbs" />
    <v-container>
      <v-row>
        <v-col cols="12" md="4" lg="4">
          <g-manager-employee
            :doc-id="docId"
            color="primary"
            @DELETE="$router.replace('/employees')"
          >
            <template #default="{ attrs, on }">
              <v-card>
                <v-container fluid>
                  <g-img-employee v-bind="attrs" />
                </v-container>
                <v-list>
                  <v-list-item v-for="(prop, index) of mainProps" :key="index">
                    <v-list-item-content>
                      <v-list-item-subtitle>
                        {{ prop.text }}
                      </v-list-item-subtitle>
                      <v-list-item-title>
                        {{ attrs[prop.value] }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <v-card-actions class="justify-end">
                  <g-btn-edit
                    :color="attrs.color"
                    icon
                    @click="on['click:edit']"
                  />
                </v-card-actions>
              </v-card>
            </template>
          </g-manager-employee>
        </v-col>
        <v-col cols="12" md="8" lg="8">
          <v-row>
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
            <v-col cols="12">
              <g-card-employee-medical-checkups
                :employee-id="listeners.employee.docId"
                :color="$FUTURE_COLOR_INDEX(3)"
              />
            </v-col>
            <v-col v-if="$store.getters['auth/isAdmin']" cols="12" lg="6">
              <g-card-employee-contracts
                :employee-id="listeners.employee.docId"
                height="100%"
                :color="$FUTURE_COLOR_INDEX(4)"
              />
            </v-col>
            <v-col cols="12" lg="6">
              <g-card-employee-security-registration
                height="100%"
                :doc-id="docId"
                :color="$FUTURE_COLOR_INDEX(5)"
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
        </v-col>
      </v-row>
    </v-container>
  </g-template-default>
</template>

<style></style>
