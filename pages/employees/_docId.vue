<script>
/**
 * 従業員の詳細画面です。
 * @author shisyamo4131
 */
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import GCardEmployeeSecurityRegistration from '~/components/molecules/cards/GCardEmployeeSecurityRegistration.vue'
import GCardEmployeeContracts from '~/components/molecules/cards/GCardEmployeeContracts.vue'
import GCardEmployeeMedicalCheckups from '~/components/organisms/Cards/GCardEmployeeMedicalCheckups.vue'
import GManagerEmployee from '~/components/managers/GManagerEmployee.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GBtnEdit from '~/components/atoms/btns/GBtnEdit.vue'
import GImgEmployee from '~/components/molecules/images/GImgEmployee.vue'
import HealthInsurance from '~/models/HealthInsurance'
import Pension from '~/models/Pension'
import EmploymentInsurance from '~/models/EmploymentInsurance'
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GCardFloatingLabel from '~/components/atoms/cards/GCardFloatingLabel.vue'
import GCardHealthInsurance from '~/components/molecules/cards/GCardHealthInsurance.vue'
import GCardPension from '~/components/molecules/cards/GCardPension.vue'
import GCardEmploymentInsurance from '~/components/molecules/cards/GCardEmploymentInsurance.vue'
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
    GCardEmployeeMedicalCheckups,
    GManagerEmployee,
    GTemplateDefault,
    GBtnEdit,
    GImgEmployee,
    AirArrayManager,
    GCardFloatingLabel,
    GCardHealthInsurance,
    GCardPension,
    GCardEmploymentInsurance,
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
    const instances = {
      healthInsurances: new HealthInsurance(),
      pensions: new Pension(),
      employmentInsurances: new EmploymentInsurance(),
    }
    const condition = [
      ['where', 'employeeId', '==', docId],
      ['orderBy', 'acquisitionDate', 'desc'],
      ['limit', 3],
    ]
    const items = {
      healthInsurances: instances.healthInsurances.subscribeDocs(condition),
      pensions: instances.pensions.subscribeDocs(condition),
      employmentInsurances:
        instances.employmentInsurances.subscribeDocs(condition),
    }
    return { docId, instances, items }
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
    Object.keys(this.instances).forEach((key) => {
      this.instances[key].unsubscribe()
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
    <g-manager-employee
      :doc-id="docId"
      color="primary"
      @DELETE="$router.replace('/employees')"
    >
      <template #default="{ attrs, on }">
        <v-container>
          <v-row>
            <v-col cols="12" md="4" lg="4">
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
            </v-col>
            <v-col cols="12" md="8" lg="8">
              <v-row>
                <!-- 健康保険 -->
                <v-col cols="12" lg="4">
                  <air-array-manager
                    :color="$FUTURE_COLOR_INDEX(0)"
                    :items="items.healthInsurances"
                    :schema="instances.healthInsurances"
                  >
                    <template #default="{ table, color }">
                      <g-card-floating-label
                        label="健康保険"
                        :color="color"
                        icon="mdi-hospital-box"
                      >
                        <v-container>
                          <v-data-iterator
                            v-bind="table.attrs"
                            hide-default-footer
                          >
                            <template #default="iteratorProps">
                              <v-window
                                :value="iteratorProps.items.length - 1"
                                show-arrows
                                show-arrows-on-hover
                              >
                                <v-window-item
                                  v-for="(item, index) in iteratorProps.items"
                                  :key="index"
                                >
                                  <g-card-health-insurance
                                    v-bind="item"
                                    outlined
                                  />
                                </v-window-item>
                              </v-window>
                            </template>
                            <template #no-data>
                              <v-card outlined>
                                <v-card-text>加入していません。</v-card-text>
                              </v-card>
                            </template>
                          </v-data-iterator>
                        </v-container>
                      </g-card-floating-label>
                    </template>
                  </air-array-manager>
                </v-col>
                <!-- 厚生年金 -->
                <v-col cols="12" lg="4">
                  <air-array-manager
                    :color="$FUTURE_COLOR_INDEX(1)"
                    :items="items.pensions"
                    :schema="instances.pensions"
                  >
                    <template #default="{ table, color }">
                      <g-card-floating-label
                        label="厚生年金"
                        :color="color"
                        icon="mdi-hospital-box"
                      >
                        <v-container>
                          <v-data-iterator
                            v-bind="table.attrs"
                            hide-default-footer
                          >
                            <template #default="iteratorProps">
                              <v-window
                                :value="iteratorProps.items.length - 1"
                                show-arrows
                                show-arrows-on-hover
                              >
                                <v-window-item
                                  v-for="(item, index) in iteratorProps.items"
                                  :key="index"
                                >
                                  <g-card-pension v-bind="item" outlined />
                                </v-window-item>
                              </v-window>
                            </template>
                            <template #no-data>
                              <v-card outlined>
                                <v-card-text>加入していません。</v-card-text>
                              </v-card>
                            </template>
                          </v-data-iterator>
                        </v-container>
                      </g-card-floating-label>
                    </template>
                  </air-array-manager>
                </v-col>
                <!-- 雇用保険 -->
                <v-col cols="12" lg="4">
                  <air-array-manager
                    :color="$FUTURE_COLOR_INDEX(2)"
                    :items="items.employmentInsurances"
                    :schema="instances.employmentInsurances"
                  >
                    <template #default="{ table, color }">
                      <g-card-floating-label
                        label="雇用保険"
                        :color="color"
                        icon="mdi-hospital-box"
                      >
                        <v-container>
                          <v-data-iterator
                            v-bind="table.attrs"
                            hide-default-footer
                          >
                            <template #default="iteratorProps">
                              <v-window
                                :value="iteratorProps.items.length - 1"
                                show-arrows
                                show-arrows-on-hover
                              >
                                <v-window-item
                                  v-for="(item, index) in iteratorProps.items"
                                  :key="index"
                                >
                                  <g-card-employment-insurance
                                    v-bind="item"
                                    outlined
                                  />
                                </v-window-item>
                              </v-window>
                            </template>
                            <template #no-data>
                              <v-card outlined>
                                <v-card-text>加入していません。</v-card-text>
                              </v-card>
                            </template>
                          </v-data-iterator>
                        </v-container>
                      </g-card-floating-label>
                    </template>
                  </air-array-manager>
                </v-col>
                <v-col cols="12">
                  <g-card-employee-medical-checkups
                    :employee-id="docId"
                    :color="$FUTURE_COLOR_INDEX(3)"
                  />
                </v-col>
                <v-col v-if="$store.getters['auth/isAdmin']" cols="12" lg="6">
                  <g-card-employee-contracts
                    :employee-id="docId"
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
                    :value="attrs.address1 || ''"
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
      </template>
    </g-manager-employee>
  </g-template-default>
</template>

<style></style>
