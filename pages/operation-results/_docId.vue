<script>
/**
 * 稼働実績の詳細画面です。
 * @author shisyamo4131
 * @refact 2025-01-25
 */
import AirItemManager from '~/components/air/AirItemManager.vue'
import GBtnEdit from '~/components/atoms/btns/GBtnEdit.vue'
import GInputOperationResultV2 from '~/components/molecules/inputs/GInputOperationResultV2.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import OperationResult from '~/models/OperationResult'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'OperationResultDetail',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    AirItemManager,
    GInputOperationResultV2,
    GBtnEdit,
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
      instance: new OperationResult(),
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
        { text: '稼働実績', to: this.parentPath, exact: true },
        { text: '稼働実績詳細', to: `${this.parentPath}/${this.docId}` },
      ]
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
     * AirItemManager の処理を上書きします。
     */
    async handleUpdate(item) {
      await item.update()
    },
    async handleDelete(item) {
      await item.delete()
    },
  },
}
</script>

<template>
  <g-template-default>
    <v-container>
      <v-breadcrumbs :items="breadcrumbs" />
      <air-item-manager
        :dialog-props="{ fullscreen: true }"
        :handle-update="handleUpdate"
        :handle-delete="handleDelete"
        :item="instance"
        label="稼働実績"
        @DELETE="$router.replace(`/operation-results`)"
      >
        <template #default="defaultProps">
          <v-card>
            <v-toolbar flat>
              <v-toolbar-title>稼働実績詳細</v-toolbar-title>
              <v-spacer />
              <g-btn-edit icon @click="defaultProps.toUpdate" />
            </v-toolbar>
            <v-container fluid>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    :value="
                      $store.getters['sites/get'](instance.siteId)?.name ||
                      'N/A'
                    "
                    label="現場"
                    readonly
                  />
                </v-col>
                <v-col>
                  <v-text-field :value="instance.date" label="日付" readonly />
                </v-col>
                <v-col>
                  <v-text-field
                    :value="$DAY_DIV[instance.dayDiv]"
                    label="曜日区分"
                    readonly
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    :value="$WORK_SHIFT[instance.workShift]"
                    label="勤務区分"
                    readonly
                  />
                </v-col>
              </v-row>
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
            </v-container>
          </v-card>
        </template>
        <template #inputs="{ attrs, on }">
          <g-input-operation-result-v-2 v-bind="attrs" v-on="on" />
        </template>
      </air-item-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
