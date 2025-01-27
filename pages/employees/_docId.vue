<script>
/**
 * 従業員の詳細画面です。
 * @author shisyamo4131
 * @refact 2025-01-20
 */
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GBtnEdit from '~/components/atoms/btns/GBtnEdit.vue'
import GImgEmployee from '~/components/molecules/images/GImgEmployee.vue'
import HealthInsurance from '~/models/HealthInsurance'
import Pension from '~/models/Pension'
import EmploymentInsurance from '~/models/EmploymentInsurance'
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GCardFloatingLabel from '~/components/atoms/cards/GCardFloatingLabel.vue'
import MedicalCheckup from '~/models/MedicalCheckup'
import EmployeeContract from '~/models/EmployeeContract'
import GListIterator from '~/components/atoms/lists/GListIterator.vue'
import Employee from '~/models/Employee'
import AirItemManager from '~/components/air/AirItemManager.vue'
import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
import GInputSecurityRegistration from '~/components/molecules/inputs/GInputSecurityRegistration.vue'
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
    GTemplateDefault,
    GBtnEdit,
    GImgEmployee,
    AirArrayManager,
    GCardFloatingLabel,
    GListIterator,
    AirItemManager,
    GInputEmployee,
    GInputSecurityRegistration,
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
      employee: new Employee(),
      healthInsurances: new HealthInsurance(),
      pensions: new Pension(),
      employmentInsurances: new EmploymentInsurance(),
      medicalCheckups: new MedicalCheckup(),
      contracts: new EmployeeContract(),
    }
    const condition = [
      ['where', 'employeeId', '==', docId],
      ['orderBy', 'acquisitionDate', 'desc'],
      ['limit', 3],
    ]
    const items = {
      employee: instances.employee.subscribe(docId),
      healthInsurances: instances.healthInsurances.subscribeDocs(condition),
      pensions: instances.pensions.subscribeDocs(condition),
      employmentInsurances:
        instances.employmentInsurances.subscribeDocs(condition),
      medicalCheckups: instances.medicalCheckups.subscribeDocs([
        ['where', 'employeeId', '==', docId],
      ]),
      contracts: instances.contracts.subscribeDocs([
        ['where', 'employeeId', '==', docId],
      ]),
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

    /**
     * 警備員登録情報として表示する項目の配列です。
     */
    securityRegistrationProps() {
      return [
        {
          icon: 'mdi-calendar-check',
          text: '警備員登録日',
          value: 'registrationDate',
          transformation: (value) => {
            if (!value) return 'N/A'
            return this.$dayjs(value).format('YYYY年MM月DD日')
          },
        },
        {
          icon: 'mdi-calendar-arrow-right',
          text: '警備経験開始日',
          value: 'securityStartDate',
          transformation: (value) => {
            if (!value) return 'N/A'
            return this.$dayjs(value).format('YYYY年MM月DD日')
          },
        },
        {
          icon: 'mdi-timer-sand',
          text: 'ブランク',
          value: 'blankMonths',
          transformation: (value) => {
            return `${value}ヶ月`
          },
        },
        {
          icon: 'mdi-home-map-marker',
          text: '本籍地',
          value: 'honseki',
        },
        {
          icon: 'mdi-account-alert',
          text: '緊急連絡先氏名',
          value: 'emergencyContactName',
          transformation: (value, item) => {
            return `${value} (${item.emergencyContactRelationDetail})`
          },
        },
        {
          icon: 'mdi-map-marker-alert',
          text: '緊急連絡先住所',
          value: 'emergencyContactAddress',
        },
        {
          icon: 'mdi-phone-alert',
          text: '緊急連絡先電話番号',
          value: 'emergencyContactTel',
        },
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
  methods: {
    async handleUpdate(item) {
      await item.update()
    },
    async handleDelete(item) {
      await item.delete()
      this.$router.replace('/employees')
    },
  },
}
</script>

<template>
  <g-template-default>
    <v-breadcrumbs :items="breadcrumbs" />
    <air-item-manager
      :item="instances.employee"
      color="primary"
      :dialog-props="{ maxWidth: 600 }"
      :handle-update="handleUpdate"
      :handle-delete="handleDelete"
      label="従業員情報"
    >
      <template #default="defaultProps">
        <v-container>
          <v-row>
            <v-col cols="12" md="4" lg="4">
              <v-card>
                <v-container fluid>
                  <g-img-employee v-bind="defaultProps.attrs" />
                </v-container>
                <v-list>
                  <v-list-item v-for="(prop, index) of mainProps" :key="index">
                    <v-list-item-content>
                      <v-list-item-subtitle>
                        {{ prop.text }}
                      </v-list-item-subtitle>
                      <v-list-item-title>
                        {{ defaultProps.attrs[prop.value] }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <v-card-actions class="justify-end">
                  <g-btn-edit
                    :color="defaultProps.attrs.color"
                    icon
                    @click="defaultProps.on['click:edit']"
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
                                  <v-card outlined>
                                    <v-list>
                                      <v-list-item>
                                        <v-list-item-content>
                                          <v-list-item-subtitle>
                                            資格取得日
                                          </v-list-item-subtitle>
                                          <v-list-item-title class="pb-2">
                                            {{
                                              item.acquisitionDate
                                                ? $dayjs(
                                                    item.acquisitionDate
                                                  ).format('YYYY年MM月DD日')
                                                : 'N/A'
                                            }}
                                          </v-list-item-title>
                                          <!-- 標準報酬月額は一旦不可視に -->
                                          <!--
                                          <v-list-item-subtitle> 標準報酬月額 </v-list-item-subtitle>
                                          <v-list-item-title class="pb-2">
                                            {{ item.amount }}
                                          </v-list-item-title>
                                          -->
                                          <v-list-item-subtitle>
                                            被保険者整理番号
                                          </v-list-item-subtitle>
                                          <v-list-item-title>
                                            {{ item.policyNumber }}
                                          </v-list-item-title>
                                        </v-list-item-content>
                                      </v-list-item>
                                    </v-list>
                                  </v-card>
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
                                  <v-card outlined>
                                    <v-list>
                                      <v-list-item>
                                        <v-list-item-icon>
                                          <v-icon :color="color" x-large
                                            >mdi-card-account-details</v-icon
                                          >
                                        </v-list-item-icon>
                                        <v-list-item-content>
                                          <v-list-item-subtitle>
                                            資格取得日
                                          </v-list-item-subtitle>
                                          <v-list-item-title class="pb-2">
                                            {{
                                              item.acquisitionDate
                                                ? $dayjs(
                                                    item.acquisitionDate
                                                  ).format('YYYY年MM月DD日')
                                                : 'N/A'
                                            }}
                                          </v-list-item-title>
                                          <!-- 標準報酬月額は一旦不可視に -->
                                          <!--
                                          <v-list-item-subtitle> 標準報酬月額 </v-list-item-subtitle>
                                          <v-list-item-title class="pb-2">
                                            {{ item.amount }}
                                          </v-list-item-title>
                                          -->
                                          <v-list-item-subtitle>
                                            被保険者整理番号
                                          </v-list-item-subtitle>
                                          <v-list-item-title>
                                            {{ item.policyNumber }}
                                          </v-list-item-title>
                                        </v-list-item-content>
                                      </v-list-item>
                                    </v-list>
                                  </v-card>
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
                                  <v-card outlined>
                                    <v-list>
                                      <v-list-item>
                                        <v-list-item-icon>
                                          <v-icon :color="color" x-large
                                            >mdi-card-account-details</v-icon
                                          >
                                        </v-list-item-icon>
                                        <v-list-item-content>
                                          <v-list-item-subtitle>
                                            資格取得日
                                          </v-list-item-subtitle>
                                          <v-list-item-title class="pb-2">
                                            {{
                                              item.acquisitionDate
                                                ? $dayjs(
                                                    item.acquisitionDate
                                                  ).format('YYYY年MM月DD日')
                                                : 'N/A'
                                            }}
                                          </v-list-item-title>
                                          <v-list-item-subtitle>
                                            被保険者整理番号
                                          </v-list-item-subtitle>
                                          <v-list-item-title>
                                            {{ item.policyNumber }}
                                          </v-list-item-title>
                                        </v-list-item-content>
                                      </v-list-item>
                                    </v-list>
                                  </v-card>
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
                <!-- 健康診断 -->
                <v-col cols="12">
                  <air-array-manager
                    :color="$FUTURE_COLOR_INDEX(3)"
                    :items="items.medicalCheckups"
                    :schema="instances.medicalCheckups"
                  >
                    <template #default="{ table, color, pagination }">
                      <g-card-floating-label
                        :color="color"
                        label="健康診断"
                        icon="mdi-heart-pulse"
                      >
                        <v-container>
                          <v-data-table
                            v-bind="table.attrs"
                            :headers="[
                              { text: '受診日', value: 'date' },
                              { text: '受診機関', value: 'agency' },
                              { text: '血圧', value: 'bloodPressure' },
                              { text: '所見', value: 'hasFindings' },
                            ]"
                            hide-default-footer
                            sort-by="date"
                            sort-desc
                            v-on="table.on"
                          />
                          <v-container fluid>
                            <v-row justify="center">
                              <v-col cols="10">
                                <v-pagination
                                  v-bind="pagination.attrs"
                                  v-on="pagination.on"
                                />
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-container>
                      </g-card-floating-label>
                    </template>
                  </air-array-manager>
                </v-col>
                <!-- 雇用契約 -->
                <v-col v-if="$store.getters['auth/isAdmin']" cols="12">
                  <air-array-manager
                    :items="items.contracts"
                    :schema="instances.contracts"
                    :color="$FUTURE_COLOR_INDEX(4)"
                  >
                    <template #default="{ table, color, pagination }">
                      <g-card-floating-label
                        :color="color"
                        label="雇用契約"
                        icon="mdi-file-sign"
                      >
                        <v-data-table
                          v-bind="table.attrs"
                          :headers="[
                            { text: '契約日', value: 'startDate' },
                            {
                              text: '雇用形態',
                              value: 'contractType',
                              sortable: false,
                            },
                            {
                              text: '支給形態',
                              value: 'paymentType',
                              sortable: false,
                            },
                          ]"
                          hide-default-footer
                          :items-per-page="3"
                          sort-by="startDate"
                          sort-desc
                          v-on="table.on"
                        >
                          <template #[`item.contractType`]="{ item }">
                            {{ $CONTRACT_TYPE[item.contractType] }}
                          </template>
                          <template #[`item.paymentType`]="{ item }">
                            {{ $PAYMENT_TYPE[item.paymentType] }}
                          </template>
                        </v-data-table>
                        <v-container fluid>
                          <v-row justify="center">
                            <v-col cols="10">
                              <v-pagination
                                v-bind="pagination.attrs"
                                v-on="pagination.on"
                              />
                            </v-col>
                          </v-row>
                        </v-container>
                      </g-card-floating-label>
                    </template>
                  </air-array-manager>
                </v-col>
                <!-- 警備員登録情報 -->
                <v-col cols="12">
                  <air-item-manager
                    :item="instances.employee"
                    :color="$FUTURE_COLOR_INDEX(5)"
                    :dialog-props="{ maxWidth: 600 }"
                    disable-delete
                    :handle-update="handleUpdate"
                    :handle-delete="handleDelete"
                    label="警備員登録情報"
                  >
                    <template #default="{ attrs, on }">
                      <g-card-floating-label v-bind="attrs" icon="mdi-shield">
                        <g-list-iterator
                          :icon-color="attrs.color"
                          :lists="securityRegistrationProps"
                          :item="attrs.securityRegistration"
                        />
                        <template #actions>
                          <g-btn-edit
                            :color="attrs.color"
                            icon
                            @click="on['click:edit']"
                          />
                        </template>
                      </g-card-floating-label>
                    </template>
                    <template #inputs="{ attrs, on }">
                      <g-input-security-registration v-bind="attrs" v-on="on" />
                    </template>
                  </air-item-manager>
                </v-col>
                <!-- 地図 -->
                <v-col cols="12">
                  <g-card-map
                    :value="defaultProps.attrs.address1 || ''"
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
      <template #inputs="{ attrs, on }">
        <g-input-employee v-bind="attrs" v-on="on" />
      </template>
    </air-item-manager>
  </g-template-default>
</template>

<style></style>
