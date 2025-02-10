<script>
/**
 * 従業員の詳細画面です。
 * @author shisyamo4131
 * @refact 2025-02-10
 */
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
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
import AirItemManager from '~/components/air/AirItemManager.vue'
import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
import GInputSecurityRegistration from '~/components/molecules/inputs/GInputSecurityRegistration.vue'
import GPagination from '~/components/atoms/paginations/GPagination.vue'
import GDocumentManagerEmployee from '~/components/managers/GDocumentManagerEmployee.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GCollectionManager from '~/components/managers/GCollectionManager.vue'
import GInputHealthInsurance from '~/components/molecules/inputs/GInputHealthInsurance.vue'
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
    GPagination,
    GDocumentManagerEmployee,
    GBtnRegist,
    GCollectionManager,
    GInputHealthInsurance,
  },

  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app, route }) {
    const docId = route.params.docId
    const instances = {
      healthInsurances: new HealthInsurance({ employeeId: docId }),
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
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    Object.keys(this.instances).forEach((key) => {
      this.instances[key].unsubscribe()
    })
  },
}
</script>

<template>
  <g-template-default>
    <v-breadcrumbs :items="breadcrumbs" />
    <g-document-manager-employee :doc-id="docId">
      <template #default="defaultProps">
        <v-container>
          <v-row>
            <!-- 従業員概要 -->
            <v-col cols="12" md="4" lg="4">
              <v-card>
                <v-container fluid>
                  <g-img-employee v-bind="defaultProps.attrs" />
                </v-container>
                <v-list>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-code-tags</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ defaultProps.attrs.code }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-map-marker</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ defaultProps.attrs.address1 }}
                      </v-list-item-title>
                      <v-list-item-subtitle v-if="defaultProps.attrs.address2">
                        {{ defaultProps.attrs.address2 }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-phone</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ defaultProps.attrs.mobile }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-calendar</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ defaultProps.attrs.hireDate }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-cake</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ defaultProps.attrs.birth }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-gender-male-female</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ defaultProps.attrs.gender }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-blood-bag</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ defaultProps.attrs.bloodType }}
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
                  <g-collection-manager
                    :color="$FUTURE_COLOR_INDEX(0)"
                    :dialog-props="{ maxWidth: 600 }"
                    :items="items.healthInsurances"
                    :instance="instances.healthInsurances"
                    label="健康保険情報編集"
                  >
                    <template #default="{ table, color, activator }">
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
                        <v-card-actions class="justify-end">
                          <g-btn-regist
                            v-bind="activator.attrs"
                            icon
                            v-on="activator.on"
                          />
                          <g-btn-edit v-bind="activator.attrs" icon />
                        </v-card-actions>
                      </g-card-floating-label>
                    </template>
                    <template #inputs="{ attrs, on }">
                      <g-input-health-insurance
                        v-bind="attrs"
                        hide-employee
                        v-on="on"
                      />
                    </template>
                  </g-collection-manager>
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
                          <g-pagination
                            v-bind="pagination.attrs"
                            v-on="pagination.on"
                          />
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
                            {{
                              $EMPLOYEE_CONTRACT_TYPE_ARRAY[item.contractType]
                            }}
                          </template>
                          <template #[`item.paymentType`]="{ item }">
                            {{ $PAYMENT_TYPE[item.paymentType] }}
                          </template>
                        </v-data-table>
                        <g-pagination
                          v-bind="pagination.attrs"
                          v-on="pagination.on"
                        />
                      </g-card-floating-label>
                    </template>
                  </air-array-manager>
                </v-col>
                <!-- 警備員登録情報 -->
                <v-col cols="12">
                  <air-item-manager
                    :item="defaultProps.item"
                    :color="$FUTURE_COLOR_INDEX(5)"
                    :dialog-props="{ maxWidth: 600 }"
                    disable-delete
                    :handle-update="async (item) => await item.update()"
                    label="警備員登録情報"
                  >
                    <template #default="{ attrs, on }">
                      <g-card-floating-label
                        v-bind="attrs"
                        label="警備員登録情報"
                        icon="mdi-shield"
                      >
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
    </g-document-manager-employee>
  </g-template-default>
</template>

<style></style>
