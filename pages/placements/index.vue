<template>
  <g-template-default>
    <v-card style="height: 100%" class="d-flex flex-column" tile>
      <v-toolbar color="secondary" dark class="flex-grow-0" dense flat>
        <v-toolbar-title>配置管理</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn text><v-icon left>mdi-chevron-left</v-icon>前の週へ</v-btn>
          <v-btn text>次の週へ<v-icon right>mdi-chevron-right</v-icon></v-btn>
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
          <div class="overflow-hidden d-flex flex-grow-1">
            <g-placement-table
              id="placement-table"
              class="flex-table"
              :current-date="currentDate"
              :ellipsis="ellipsis"
              :length="length"
              :site-order.sync="siteOrder"
            >
              <template #site-row="{ attrs, on }">
                <g-placement-site-work-shift-row v-bind="attrs" v-on="on" />
              </template>
              <template #col="{ attrs, on }">
                <g-placement-employee-card v-bind="attrs" v-on="on" />
              </template>
            </g-placement-table>
          </div>
        </v-sheet>
      </div>
    </v-card>
  </g-template-default>
</template>

<script>
import dayjs from 'dayjs'
import GPlacementEmployeeCard from '~/components/organisms/placements/GPlacementEmployeeCard.vue'
import GPlacementTable from '~/components/organisms/placements/GPlacementTable.vue'
import GPlacementSiteSelector from '~/components/organisms/placements/GPlacementSiteSelector.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
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
    GPlacementEmployeeCard,
    GPlacementTable,
    GPlacementSiteSelector,
    GCheckbox,
    GTemplateDefault,
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
     * Vuex.assginments の内容を返します。
     */
    assignments() {
      const result = {
        employees: this.$store.state.assignments.employees,
        sites: this.$store.state.assignments.sites,
      }
      return result
    },

    /**
     * getter: Vuex.site-order の内容を返します。
     * setter: Vuex.site-order.dispatch.update を実行します。
     */
    siteOrder: {
      get() {
        return this.$store.state['site-order'].data
      },
      set(v) {
        this.$store.dispatch('site-order/update', v)
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
            Object.keys(workShifts).map((workShift) => ({
              id: `${siteId}-${workShift}`,
              siteId,
              workShift,
            }))
          )
      )

      return assigned.filter(
        ({ id }) => !this.siteOrder.some((order) => order.id === id)
      )
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.currentDate を監視します。
     * - Vuex.assignments への購読を解除します。
     * - from, to が有効だと判断できる場合のみ、 Vuex.assignments への購読を開始します。
     */
    currentDate: {
      handler() {
        this.$store.dispatch('assignments/unsubscribe')
        if (!this.from || !this.to) return
        this.$store.dispatch('assignments/subscribe', {
          from: this.from,
          to: this.to,
        })
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * MOUNTED
   ***************************************************************************/
  mounted() {
    // Vuex.site-order への購読を開始します。
    this.$store.dispatch('site-order/subscribe')
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    // Vuex.site-order, assignments への購読を解除します。
    this.$store.dispatch('site-order/unsubscribe')
    this.$store.dispatch('assignments/unsubscribe')
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 引数で受け取った現場-勤務区分を site-order に追加します。
     */
    async onNewSiteSeleced({ siteId, workShift }) {
      await this.$store.dispatch('site-order/add', { siteId, workShift })
    },

    /**
     * computed.hiddenSites を参照し、対象の現場-勤務区分を site-order に追加します。
     */
    async onClickShowHiddenSites() {
      if (!this.hiddenSites.length) return
      await Promise.all(
        this.hiddenSites.map(({ siteId, workShift }) =>
          this.$store.dispatch('site-order/add', { siteId, workShift })
        )
      )
    },
  },
}
</script>

<style></style>
