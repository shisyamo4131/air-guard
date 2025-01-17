<script>
/**
 * 稼働実績情報管理コンポーネント
 * @author shisyamo4131
 * @refact 2025-01-16
 */
import GDataTableOperationResults from '../atoms/tables/GDataTableOperationResults.vue'
import GBtnRegist from '../atoms/btns/GBtnRegist.vue'
import GInputOperationResultSelectSite from '../molecules/inputs/GInputOperationResultSelectSite.vue'
import GInputOperationResultSelectDate from '../molecules/inputs/GInputOperationResultSelectDate.vue'
import GInputOperationResultSelectWorkShift from '../molecules/inputs/GInputOperationResultSelectWorkShift.vue'
import GInputOperationResultSelectWorkers from '../molecules/inputs/GInputOperationResultSelectWorkers.vue'
import GDialogMonthPicker from '../molecules/dialogs/GDialogMonthPicker.vue'
import AirArrayManager from '../air/AirArrayManager.vue'
import OperationResult from '~/models/OperationResult'
import SiteContract from '~/models/SiteContract'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTableOperationResults,
    GBtnRegist,
    GInputOperationResultSelectSite,
    GInputOperationResultSelectDate,
    GInputOperationResultSelectWorkShift,
    GInputOperationResultSelectWorkers,
    GDialogMonthPicker,
    AirArrayManager,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      month: this.$dayjs().format('YYYY-MM'),
      items: [],
      schema: new OperationResult(),
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    month: {
      handler(v) {
        this.subscribe()
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * MOUNTED
   ***************************************************************************/
  mounted() {},

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.schema.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async handleCreate(item) {
      await item.create()
    },
    async handleUpdate(item) {
      await item.update()
    },
    async handleDelete(item) {
      await item.delete()
    },

    /**
     * ステップごとに適用する処理です。
     */
    async stepValidator(item, step, updateProperties) {
      if (step === 3) await this.reloadContract(item, updateProperties)
    },

    /**
     * 現場取極め情報を取得・更新します。
     */
    async reloadContract(item, updateProperties) {
      const siteContractId = item.siteContractId
      const isMatched = siteContractId === item.siteContract.docId
      if (siteContractId && isMatched) return
      const { siteId, date, workShift } = item
      const instance = new SiteContract()
      await instance.loadContract({ siteId, date, workShift }).catch((err) => {
        throw new Error(`現場取極め情報の取得に失敗しました: ${err.message}`)
      })
      updateProperties({ siteContract: instance })
    },

    /**
     * 稼働実績ドキュメントの購読を開始します。
     */
    subscribe() {
      this.items = this.schema.subscribeDocs([
        ['where', 'month', '==', this.month],
      ])
    },
  },
}
</script>

<template>
  <air-array-manager
    v-bind="$attrs"
    :dialog-props="{ fullscreen: $vuetify.breakpoint.mobile, maxWidth: 480 }"
    event-edit="click:row"
    :handle-create="handleCreate"
    :handle-update="handleUpdate"
    :handle-delete="handleDelete"
    :items="items"
    label="稼働実績情報"
    :schema="schema"
    :steps="['現場選択', '日付選択', '勤務区分選択', '従業員選択']"
    :step-validator="stepValidator"
    v-on="$listeners"
  >
    <template #default="{ activator, pagination, height, table }">
      <v-sheet class="d-flex flex-column" :height="height">
        <v-toolbar class="flex-grow-0" flat>
          <g-dialog-month-picker v-model="month">
            <template #activator="{ attrs, on }">
              <v-text-field
                style="max-width: 132px"
                class="center-input"
                v-bind="attrs"
                hide-details
                prepend-inner-icon="mdi-calendar"
                @click:prepend-inner="on['click']"
                v-on="on"
              />
            </template>
          </g-dialog-month-picker>
          <v-spacer />
          <g-btn-regist v-bind="activator.attrs" icon v-on="activator.on" />
          <template #extension>
            <v-text-field />
          </template>
        </v-toolbar>
        <div class="d-flex flex-grow-1 overflow-y-hidden">
          <g-data-table-operation-results
            class="flex-table"
            v-bind="table.attrs"
            v-on="table.on"
          />
        </div>
        <v-container fluid>
          <v-row justify="center">
            <v-col cols="10">
              <v-pagination v-bind="pagination.attrs" v-on="pagination.on" />
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>
    </template>
    <template #step-0="{ attrs, on }">
      <g-input-operation-result-select-site v-bind="attrs" v-on="on" />
    </template>
    <template #step-1="{ attrs, on }">
      <g-input-operation-result-select-date v-bind="attrs" v-on="on" />
    </template>
    <template #step-2="{ attrs, on }">
      <g-input-operation-result-select-work-shift v-bind="attrs" v-on="on" />
    </template>
    <template #step-3="{ attrs, on }">
      <g-input-operation-result-select-workers v-bind="attrs" v-on="on" />
    </template>
  </air-array-manager>
</template>

<style></style>
