<script>
/**
 * 請求稼働実績の詳細画面です。
 * @author shisyamo4131
 * @refact 2025-01-25
 */
import AirItemManager from '~/components/air/AirItemManager.vue'
import GIconEdit from '~/components/atoms/icons/GIconEdit.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GDatePicker from '~/components/atoms/pickers/GDatePicker.vue'
import GInputOperationCount from '~/components/molecules/inputs/GInputOperationCount.vue'
import GInputUnitPrice from '~/components/molecules/inputs/GInputUnitPrice.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import OperationBillingBasis from '~/models/OperationBillingBasis'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'OperationBillingBasesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    AirItemManager,
    GInputOperationCount,
    GInputUnitPrice,
    GIconEdit,
    GDatePicker,
    GSwitch,
  },

  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ route }) {
    const docId = route.params.docId
    return { docId }
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new OperationBillingBasis(),
      internalIsLocked: false,
      loading: false,
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
        { text: '請求稼働実績', to: this.parentPath, exact: true },
        { text: '請求稼働実績詳細', to: `${this.parentPath}/${this.docId}` },
      ]
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    isLocked: {
      handler(v) {
        this.internalIsLocked = v
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * CREATED/DESTROYED
   ***************************************************************************/
  created() {
    this.instance.subscribe(this.docId)
  },
  destroyed() {
    this.instance.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * ドキュメントのロック状態を切り替えます
     */
    async toggleIsLocked(event) {
      this.loading = true
      const preValue = !event
      try {
        this.instance.isLocked = event
        await this.instance.update()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        alert(err.message)
        this.internalIsLocked = preValue
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <g-template-default>
    <v-container>
      <v-breadcrumbs :items="breadcrumbs" />
      <v-card outlined>
        <v-toolbar color="primary" dark dense flat>
          <v-toolbar-title>請求稼働実績詳細</v-toolbar-title>
          <v-spacer />
          <g-switch
            v-model="internalIsLocked"
            label="ロックする"
            hide-details
            @change="toggleIsLocked"
          />
        </v-toolbar>
        <v-container fluid>
          <v-row>
            <v-col cols="12">
              <v-text-field
                :value="
                  $store.getters['sites/get'](instance.siteId)?.name || 'N/A'
                "
                label="現場"
                readonly
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="4" md="3">
              <v-card outlined>
                <v-list dense>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle> 日付 </v-list-item-subtitle>
                      <v-list-item-title>
                        {{
                          $dayjs(instance.date).format('YYYY年MM月DD日(ddd)')
                        }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle> 曜日区分 </v-list-item-subtitle>
                      <v-list-item-title>
                        {{ $DAY_DIV[instance.dayDiv] }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle> 勤務区分 </v-list-item-subtitle>
                      <v-list-item-title>
                        {{ $WORK_SHIFT[instance.workShift] }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle> 締日 </v-list-item-subtitle>
                      <v-list-item-title>
                        {{
                          $dayjs(instance.closingDate).format(
                            'YYYY年MM月DD日(ddd)'
                          )
                        }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <air-item-manager
                        color="primary"
                        :dialog-props="{ maxWidth: 360 }"
                        disable-delete
                        :handle-update="async (item) => await item.update()"
                        :item="instance"
                        label="締日編集"
                        :loading="loading"
                      >
                        <template #default="{ toUpdate }">
                          <g-icon-edit @click="toUpdate" />
                        </template>
                        <template #inputs="{ attrs }">
                          <g-date-picker
                            :value="attrs.closingDate"
                            full-width
                            no-title
                            @change="updateProperties({ closingDate: $event })"
                          />
                        </template>
                      </air-item-manager>
                    </v-list-item-action>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle> 最終更新者 </v-list-item-subtitle>
                      <v-list-item-title>
                        {{ $store.getters['users/name'](instance.uid) }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle>
                        最終更新日時
                      </v-list-item-subtitle>
                      <v-list-item-title>
                        {{
                          `
                              ${
                                instance.updateAt
                                  ? $dayjs(instance.updateAt).format(
                                      'YYYY-MM-DD HH:mm'
                                    )
                                  : '-'
                              }
                            `
                        }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle> 状態 </v-list-item-subtitle>
                      <v-list-item-title>
                        {{ `${instance.isLocked ? 'ロック中' : '編集可能'}` }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle> 取極め </v-list-item-subtitle>
                      <v-list-item-title>
                        {{ `${instance.siteContract.startDate}` }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
            <v-col cols="12" sm="8" md="9">
              <v-row>
                <v-col cols="12" md="6" lg="6">
                  <v-card outlined>
                    <v-subheader>資格なし</v-subheader>
                    <v-simple-table>
                      <thead>
                        <tr>
                          <th></th>
                          <th>人工数</th>
                          <th>単価</th>
                          <th>金額</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(item, index) of ['normal', 'half', 'cancel']"
                          :key="index"
                        >
                          <td>{{ item }}</td>
                          <td>
                            {{ instance.operationCount.standard[item] }}
                          </td>
                          <td>{{ instance.unitPrice.standard[item] }}</td>
                          <td>{{ instance.sales.standard[item] }}</td>
                        </tr>
                      </tbody>
                    </v-simple-table>
                    <v-divider />
                    <v-card-actions class="justify-end">
                      <air-item-manager
                        :dialog-props="{ maxWidth: 360 }"
                        disable-delete
                        :handle-update="
                          async (item) => {
                            instance.operationCount.standard = item
                            await instance.update()
                          }
                        "
                        :item="instance.operationCount.standard"
                        label="資格なし稼働数"
                      >
                        <template #default="{ toUpdate }">
                          <v-btn icon @click="toUpdate"
                            ><v-icon>mdi-account-group</v-icon></v-btn
                          >
                        </template>
                        <template #inputs="{ attrs, on }">
                          <g-input-operation-count v-bind="attrs" v-on="on" />
                        </template>
                      </air-item-manager>
                      <air-item-manager
                        :dialog-props="{ maxWidth: 360 }"
                        disable-delete
                        :handle-update="
                          async (item) => {
                            instance.unitPrice.standard = item
                            await instance.update()
                          }
                        "
                        :item="instance.unitPrice.standard"
                        label="資格なし単価"
                      >
                        <template #default="{ toUpdate }">
                          <v-btn icon @click="toUpdate"
                            ><v-icon>mdi-at</v-icon></v-btn
                          >
                        </template>
                        <template #inputs="{ attrs, on }">
                          <g-input-unit-price v-bind="attrs" v-on="on" />
                        </template>
                      </air-item-manager>
                    </v-card-actions>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6" lg="6">
                  <v-card outlined>
                    <v-subheader>資格あり</v-subheader>
                    <v-simple-table>
                      <thead>
                        <tr>
                          <th></th>
                          <th>人工数</th>
                          <th>単価</th>
                          <th>金額</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(item, index) of ['normal', 'half', 'cancel']"
                          :key="index"
                        >
                          <td>{{ item }}</td>
                          <td>
                            {{ instance.operationCount.qualified[item] }}
                          </td>
                          <td>{{ instance.unitPrice.qualified[item] }}</td>
                          <td>{{ instance.sales.qualified[item] }}</td>
                        </tr>
                      </tbody>
                    </v-simple-table>
                    <v-divider />
                    <v-card-actions class="justify-end">
                      <air-item-manager
                        :dialog-props="{ maxWidth: 360 }"
                        disable-delete
                        :handle-update="
                          async (item) => {
                            instance.operationCount.qualified = item
                            await instance.update()
                          }
                        "
                        :item="instance.operationCount.qualified"
                        label="資格あり稼働数"
                      >
                        <template #default="{ toUpdate }">
                          <v-btn icon @click="toUpdate"
                            ><v-icon>mdi-account-group</v-icon></v-btn
                          >
                        </template>
                        <template #inputs="{ attrs, on }">
                          <g-input-operation-count v-bind="attrs" v-on="on" />
                        </template>
                      </air-item-manager>
                      <air-item-manager
                        :dialog-props="{ maxWidth: 360 }"
                        disable-delete
                        :handle-update="
                          async (item) => {
                            instance.unitPrice.qualified = item
                            await instance.update()
                          }
                        "
                        :item="instance.unitPrice.qualified"
                        label="資格なし単価"
                      >
                        <template #default="{ toUpdate }">
                          <v-btn icon @click="toUpdate"
                            ><v-icon>mdi-at</v-icon></v-btn
                          >
                        </template>
                        <template #inputs="{ attrs, on }">
                          <g-input-unit-price v-bind="attrs" v-on="on" />
                        </template>
                      </air-item-manager>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-card outlined>
                <v-data-table
                  :headers="[
                    { text: '氏名', value: 'id' },
                    { text: '勤務日', value: 'date' },
                    { text: '開始時刻', value: 'startTime' },
                    { text: '終了時刻', value: 'endTime' },
                    { text: '休憩時間', value: 'breakMinutes' },
                    { text: '残業時間', value: 'overtimeMinutes' },
                  ]"
                  :items="instance.workers.concat(instance.outsourcers)"
                  hide-default-footer
                  :items-per-page="-1"
                >
                  <template #[`item.id`]="{ item }">
                    <span v-if="item.isEmployee">
                      {{
                        $store.getters['employees/get'](item.employeeId)
                          ?.fullName || 'N/A'
                      }}
                    </span>
                    <span v-else>
                      {{
                        $store.getters['outsourcers/get'](item.outsourcerId)
                          ?.abbr || 'N/A'
                      }}
                    </span>
                  </template>
                </v-data-table>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-container>
  </g-template-default>
</template>

<style></style>
