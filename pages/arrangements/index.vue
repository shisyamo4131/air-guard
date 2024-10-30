<script>
import draggable from 'vuedraggable'
import dayjs from 'dayjs'
import GArrangementCell from '~/components/organisms/arrangements/GArrangementCell.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import ArrangementSiteWorkShiftMonitor from '~/models/ArrangementSiteWorkShiftMonitor'
import SiteContract from '~/models/SiteContract'
import ArrangementAssignmentsMonitor from '~/models/ArrangementAssignmentsMonitor'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GArrangementTable from '~/components/organisms/arrangements/GArrangementTable.vue'
import GArrangementSiteSelector from '~/components/organisms/arrangements/GArrangementSiteSelector.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GCardEmployeeArrangement from '~/components/molecules/cards/GCardEmployeeArrangement.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'ArrangementsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    draggable,
    GTemplateDefault,
    GArrangementCell,
    GSwitch,
    GArrangementTable,
    GArrangementSiteSelector,
    GCheckbox,
    GCardEmployeeArrangement,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /***********************************************************************
       * Conditions
       * - currentDate: The start date for arrangements.
       * - ellipsis: Display abbreviations if true.
       * - includesExpiredEmployee: Displays employees at list includes expired.
       * - length: The number of arrangement days.
       ***********************************************************************/
      currentDate: this.$dayjs().format('YYYY-MM-DD'),
      ellipsis: false,
      includesExpiredEmployee: false,
      length: 7,

      /***********************************************************************
       * An array of SiteContract document.
       * - It is updated by 'refreshSiteContracts' when then length of
       *   'siteWorkShiftIds' is changed.
       * - Note that it is not monitored as subscribe.
       ***********************************************************************/
      siteContracts: [],

      /***********************************************************************
       * An object which is now dragging.
       * - Provided from GArrangementCell.
       ***********************************************************************/
      draggingItem: null,

      /***********************************************************************
       * Monitors
       * - Classes for subscribing data in Realtime Database.
       * - To start subscribing to data in assignmentsMonitor,
       *   you must execute subscribe for a specified period of time.
       * - siteWorkShiftMonitor begins subscribing to data immediately upon
       *   instantiation.
       ***********************************************************************/
      assignmentsMonitor: new ArrangementAssignmentsMonitor(),
      siteWorkShiftMonitor: new ArrangementSiteWorkShiftMonitor(),
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /*************************************************************************
     * Assignmented employees information objects during specified period.
     * - Provided by `Arrangements/assignments/employees`
     * - ${date}/${employeeId}/${workShift}/${siteId}/{siteId}
     *************************************************************************/
    assignmentedEmployees() {
      return this.assignmentsMonitor?.employees || {}
    },
    /*************************************************************************
     * Assignmented sites informaion objects during specified period.
     * - Provided by `Arrangements/assignments/sites`
     * - ${date}/${siteId}/${workShift}/${employeeId}/{employeeId}
     *************************************************************************/
    assignmentedSites() {
      return this.assignmentsMonitor?.sites || {}
    },
    /*************************************************************************
     * An array of assignmented site-workShift ids which are not visible.
     * - Create from computed.assignmentedSites.
     *************************************************************************/
    hiddenSites() {
      const assigned = Object.values(this.assignmentedSites).flatMap(
        (siteIds) =>
          Object.entries(siteIds).flatMap(([siteId, workShifts]) =>
            Object.keys(workShifts).map((workShift) => `${siteId}-${workShift}`)
          )
      )

      return assigned.filter(
        (siteId) => !this.siteWorkShiftIds.includes(siteId)
      )
    },
    /*************************************************************************
     * An array of selectable employee-ids.
     * - Obtain from Vuex.
     * - Filtered by status.
     *************************************************************************/
    selectableEmployeeIds() {
      return this.$store.getters['employees/items']
        .filter(({ status }) => {
          return this.includesExpiredEmployee || status === 'active'
        })
        .sort((a, b) => a.fullNameKana.localeCompare(b.fullNameKana))
        .map(({ docId }) => docId)
    },
    /*************************************************************************
     * An array of site-workShift ids designated to be displayed.
     * - The value will be recorded in Realtime Database by the class when updated.
     *************************************************************************/
    siteWorkShiftIds: {
      get() {
        return this.siteWorkShiftMonitor?.data || []
      },
      async set(v) {
        await this.siteWorkShiftMonitor.update(v)
      },
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.currentDate を監視します。
     * - data.length から算出した期間の Arrangments/assignments への購読を開始します。
     */
    currentDate: {
      handler(v) {
        const from = v
        const to = dayjs(v).add(this.length, 'day').format('YYYY-MM-DD')
        this.assignmentsMonitor.subscribe(from, to)
      },
      immediate: true,
    },
    /**
     * computed.siteWorkShiftIds を監視します。
     * - 配列の要素数に変更が生じたら methods.refreshSiteContracs を呼び出します。
     */
    siteWorkShiftIds: {
      async handler(v) {
        if (!v.length) return
        await this.refreshSiteContracts()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   * - Arrangment/siteWorkShiftIds, Arrangment/assignments に対する購読を解除します。
   ***************************************************************************/
  destroyed() {
    this.siteWorkShiftMonitor.unsubscribe()
    this.assignmentsMonitor.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * コンポーネントが管理する現場の取極め情報を更新します。
     *
     * 機能概要:
     * - computed.siteWorkShiftIds を監視している watch から呼び出されます。
     * - computed.siteWorkShiftIds から取得した現場IDと、data.siteContracts に格納されている現場取極め情報を比較し、
     *   不足している取極め情報を取得します。
     * - data.currentDate を参照して、過去の不要な取極め情報を除外することで
     *   read 件数を抑制することが可能ですが、パフォーマンス低下を避けるため、現状ではすべての現場取極め情報を read します。
     *
     * エラーハンドリング:
     * - サーバーとの通信エラーが発生した場合、エラーメッセージをコンソールに出力します。
     * - 必要に応じてエラーハンドリングの部分でUIにエラーメッセージを表示する処理を追加できます。
     */
    async refreshSiteContracts() {
      try {
        // siteWorkShiftIds から現場IDを抽出し、重複を削除
        const siteIds = [
          ...new Set(this.siteWorkShiftIds.map((key) => key.split('-')[0])),
        ]

        // 現在保持している現場取極め情報と比較して、足りない情報の siteId を取得
        const lackedSiteIds = siteIds.filter(
          (siteId) =>
            !this.siteContracts.some(({ siteId: id }) => id === siteId)
        )

        // 足りない情報がない場合は処理を終了
        if (lackedSiteIds.length === 0) return

        // サーバーから足りない現場取極め情報を取得
        const siteContractInstance = new SiteContract()
        const lackedSiteContracts = await siteContractInstance.fetchBySiteIds(
          lackedSiteIds
        )

        // 取得した情報を siteContracts に追加
        this.siteContracts.push(...lackedSiteContracts)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('現場取極め情報の更新中にエラーが発生しました:', error)
        alert(error.message)
      }
    },
    async onNewSiteSeleced({ siteId, workShift }) {
      await this.siteWorkShiftMonitor.add(siteId, workShift)
    },
    async onClickShowHiddenSites() {
      if (!this.hiddenSites.length) return
      const promises = this.hiddenSites.map((key) => {
        const [siteId, workShift] = key.split('-')
        return this.siteWorkShiftMonitor.add(siteId, workShift)
      })
      await Promise.all(promises)
    },
  },
}
</script>

<template>
  <g-template-default>
    <v-container fluid style="height: 100%">
      <v-card style="height: 100%" class="d-flex flex-column">
        <v-toolbar class="flex-grow-0" color="primary" dark dense flat>
          <v-toolbar-title>配置管理</v-toolbar-title>
          <v-spacer />
          <v-toolbar-items>
            <g-arrangement-site-selector @selected="onNewSiteSeleced">
              <template #activator="{ attrs, on }">
                <v-btn v-bind="attrs" text v-on="on"
                  ><v-icon left>mdi-plus</v-icon>現場追加</v-btn
                >
              </template>
            </g-arrangement-site-selector>
          </v-toolbar-items>
        </v-toolbar>
        <div class="d-flex flex-grow-1 overflow-y-hidden">
          <v-sheet class="overflow-x-auto flex-grow-1 d-flex flex-column">
            <v-toolbar dense flat class="flex-grow-0">
              <g-checkbox v-model="ellipsis" hide-details label="省略表示" />
            </v-toolbar>
            <v-expand-transition>
              <v-alert
                v-show="hiddenSites.length"
                class="ma-2"
                dense
                type="error"
                outlined
                text
              >
                <v-row align="center">
                  <v-col class="grow"> 非表示現場があります。 </v-col>
                  <v-col class="shrink">
                    <v-btn color="error" small @click="onClickShowHiddenSites"
                      >表示する</v-btn
                    >
                  </v-col>
                </v-row>
              </v-alert>
            </v-expand-transition>
            <v-divider />
            <!-- 配置表部分 -->
            <div class="overflow-hidden d-flex">
              <g-arrangement-table
                class="flex-table"
                :assignments="assignmentedEmployees"
                :current-date="currentDate"
                :ellipsis="ellipsis"
                :length="length"
                :site-contracts="siteContracts"
                :site-work-shift-ids.sync="siteWorkShiftIds"
              >
                <template #default="props">
                  <g-arrangement-cell
                    v-bind="props.attrs"
                    :dragging-item.sync="draggingItem"
                  >
                    <template #default="{ attrs, on }">
                      <g-card-employee-arrangement v-bind="attrs" v-on="on" />
                    </template>
                  </g-arrangement-cell>
                </template>
              </g-arrangement-table>
            </div>
          </v-sheet>
          <!-- リスト部分 -->
          <v-sheet
            v-if="!$vuetify.breakpoint.mobile"
            class="px-4 pb-4 d-flex flex-column overflow-y-hidden"
            style="min-width: 196px"
          >
            <g-switch
              v-model="includesExpiredEmployee"
              label="退職者を含める"
            />
            <div class="pa-1 overflow-y-auto">
              <draggable
                tag="div"
                style="gap: 4px"
                class="d-flex flex-column"
                :value="selectableEmployeeIds"
                :group="{ name: 'employeeId', pull: 'clone', put: false }"
              >
                <v-chip
                  v-for="employeeId of selectableEmployeeIds"
                  :key="employeeId"
                  label
                >
                  {{ $store.getters['employees/get'](employeeId).abbr }}
                </v-chip>
              </draggable>
            </div>
          </v-sheet>
        </div>
      </v-card>
    </v-container>
  </g-template-default>
</template>

<style></style>
