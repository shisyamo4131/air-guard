<template>
  <g-template-default>
    <v-container fluid style="height: 100%">
      <v-card style="height: 100%" class="d-flex flex-column">
        <v-toolbar class="flex-grow-0" color="primary" dark dense flat>
          <v-toolbar-title>配置管理</v-toolbar-title>
          <v-spacer />
          <v-toolbar-items>
            <g-placement-site-selector @selected="onNewSiteSeleced">
              <template #activator="{ attrs, on }">
                <v-btn v-bind="attrs" text v-on="on"
                  ><v-icon left>mdi-plus</v-icon>現場追加</v-btn
                >
              </template>
            </g-placement-site-selector>
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
              <g-placement-table
                id="placement-table"
                class="flex-table"
                :assignments="assignments.employees"
                :current-date="currentDate"
                :ellipsis="ellipsis"
                :length="length"
                :site-contracts="siteContracts"
                :site-order.sync="siteOrder"
              >
                <template #site-row="{ attrs, on }">
                  <g-placement-site-work-shift-row v-bind="attrs" v-on="on" />
                </template>
                <template #col="props">
                  <g-placement-draggable-cell
                    v-bind="props.attrs"
                    :dragging-item.sync="draggingItem"
                  >
                    <template #default="{ attrs, on }">
                      <g-placement-employee-card v-bind="attrs" v-on="on" />
                    </template>
                  </g-placement-draggable-cell>
                </template>
              </g-placement-table>
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
              <g-placement-draggable-employee-list
                :includes-expired="includesExpiredEmployee"
              />
            </div>
          </v-sheet>
        </div>
      </v-card>
    </v-container>
  </g-template-default>
</template>

<script>
import dayjs from 'dayjs'
import GPlacementDraggableCell from '~/components/organisms/placements/GPlacementDraggableCell.vue'
import GPlacementDraggableEmployeeList from '~/components/organisms/placements/GPlacementDraggableEmployeeList.vue'
import GPlacementEmployeeCard from '~/components/organisms/placements/GPlacementEmployeeCard.vue'
import GPlacementTable from '~/components/organisms/placements/GPlacementTable.vue'
import { AssignmentsMonitor, SiteOrderMonitor } from '~/models/Placement'
import SiteContract from '~/models/SiteContract'
import GPlacementSiteSelector from '~/components/organisms/placements/GPlacementSiteSelector.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GPlacementSiteWorkShiftRow from '~/components/organisms/placements/GPlacementSiteWorkShiftRow.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'PlacementsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GPlacementDraggableCell,
    GPlacementEmployeeCard,
    GPlacementDraggableEmployeeList,
    GPlacementTable,
    GPlacementSiteSelector,
    GCheckbox,
    GTemplateDefault,
    GSwitch,
    GPlacementSiteWorkShiftRow,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /***********************************************************************
       * Conditions
       * - currentDate: The start date for employee placements, formatted as 'YYYY-MM-DD'.
       * - ellipsis: If true, displays abbreviations.
       * - includesExpiredEmployee: If true, includes expired employees in the list.
       * - length: The number of days for which placements are arranged.
       ***********************************************************************/
      currentDate: this.$dayjs().format('YYYY-MM-DD'),
      ellipsis: false,
      includesExpiredEmployee: false,
      length: 7,

      /***********************************************************************
       * An object which is now dragging.
       * - Provided from GArrangementCell.
       ***********************************************************************/
      draggingItem: null,

      assignmentsMonitor: new AssignmentsMonitor(),
      siteOrderMonitor: new SiteOrderMonitor(),

      siteContracts: [],
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * Returns the currentDate if set; otherwise, returns undefined.
     * - Used as the starting date reference.
     */
    from() {
      if (!this.currentDate) return undefined
      return this.currentDate
    },

    /**
     * Returns the end date for the column range based on currentDate and length.
     * - If currentDate is not set, returns undefined.
     * - Calculates the end date by adding (length - 1) days to currentDate.
     */
    to() {
      if (!this.currentDate) return undefined
      return dayjs(this.currentDate)
        .add(this.length - 1, 'day')
        .format('YYYY-MM-DD')
    },

    /**
     * Retrieves assignment data from the assignmentsMonitor.
     * - Returns an object containing employees and sites data.
     */
    assignments() {
      const result = {
        employees: this.assignmentsMonitor.employees,
        sites: this.assignmentsMonitor.sites,
      }
      return result
    },

    /**
     * An array of site-workShift ids designated to be displayed.
     * - The value will be recorded in Realtime Database by the class when updated.
     */
    siteOrder: {
      get() {
        return this.siteOrderMonitor?.data || []
      },
      async set(v) {
        await this.siteOrderMonitor.update(v)
      },
    },

    /**
     * Retrieves an array of hidden site-workShift IDs.
     * - Flattens the assignments.sites object to extract all siteId-workShift combinations.
     * - Filters out site-workShift IDs that are not present in siteOrder.
     * - Returns an array of IDs for sites and work shifts that are considered "hidden."
     */
    hiddenSites() {
      const assigned = Object.values(this.assignments.sites).flatMap(
        (siteIds) =>
          Object.entries(siteIds).flatMap(([siteId, workShifts]) =>
            Object.keys(workShifts).map((workShift) => `${siteId}-${workShift}`)
          )
      )

      return assigned.filter((siteId) => !this.siteOrder.includes(siteId))
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * Watcher for currentDate.
     * - Triggers the subscribe method whenever currentDate changes.
     * - Executes immediately upon component creation.
     */
    currentDate: {
      handler() {
        this.subscribe()
      },
      immediate: true,
    },

    /**
     * Watcher for changes in the length of siteOrder.
     * - Calls refreshSiteContracts whenever the siteOrder length changes to ensure site contracts are up-to-date.
     * - Executes immediately upon component creation.
     */
    'siteOrder.length': {
      async handler() {
        await this.refreshSiteContracts()
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * Subscribes to assignments and site order monitors within the specified date range.
     * - Calls unsubscribe first to clear any existing subscriptions.
     * - If either from or to date is not set, subscription is skipped.
     */
    subscribe() {
      this.unsubscribe()
      if (!this.from || !this.to) return
      this.assignmentsMonitor.subscribe(this.from, this.to)
      this.siteOrderMonitor.subscribe(this.from, this.to)
    },

    /**
     * Unsubscribes from both assignments and site order monitors.
     * - Ensures any active subscriptions are cleared.
     */
    unsubscribe() {
      this.assignmentsMonitor.unsubscribe()
      this.siteOrderMonitor.unsubscribe()
    },

    /**
     * Refreshes the site contract information by fetching missing data for site IDs.
     * - Extracts unique site IDs from siteOrder.
     * - Compares with existing siteContracts to identify missing site contracts.
     * - If any missing site contracts are found, fetches them from the server and adds to siteContracts.
     * - Catches and logs any errors, displaying an alert with the error message if an error occurs.
     */
    async refreshSiteContracts() {
      try {
        // Extract unique site IDs from siteOrder
        const siteIds = [
          ...new Set(this.siteOrder.map((key) => key.split('-')[0])),
        ]

        // Identify missing site contracts by comparing with existing siteContracts
        const lackedSiteIds = siteIds.filter(
          (siteId) =>
            !this.siteContracts.some(({ siteId: id }) => id === siteId)
        )

        // Exit if there are no missing site contracts
        if (lackedSiteIds.length === 0) return

        // Fetch missing site contract information from the server
        const siteContractInstance = new SiteContract()
        const lackedSiteContracts = await siteContractInstance.fetchBySiteIds(
          lackedSiteIds
        )

        // Add fetched site contracts to siteContracts
        this.siteContracts.push(...lackedSiteContracts)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error occurred while refreshing site contracts:', error)
        alert(error.message)
      }
    },

    /**
     * Adds a new site and work shift to the siteWorkShiftMonitor.
     * - Triggered when a new site is selected.
     */
    async onNewSiteSeleced({ siteId, workShift }) {
      await this.siteOrderMonitor.add(siteId, workShift)
    },

    /**
     * Shows hidden sites by adding them to the siteWorkShiftMonitor.
     * - Checks if there are any hidden sites, then adds each one to the monitor.
     * - Splits each hidden site key to extract siteId and workShift.
     */
    async onClickShowHiddenSites() {
      if (!this.hiddenSites.length) return
      const promises = this.hiddenSites.map((key) => {
        const [siteId, workShift] = key.split('-')
        return this.siteOrderMonitor.add(siteId, workShift)
      })
      await Promise.all(promises)
    },
  },
}
</script>

<style></style>
