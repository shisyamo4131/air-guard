<template>
  <g-template-default>
    <v-card style="height: 100%" class="d-flex flex-column" tile>
      <!-- ツールバーの表示 -->
      <g-placement-toolbar />
      <!-- メインコンテナ -->
      <div class="d-flex flex-grow-1 overflow-y-hidden pb-6">
        <v-sheet class="overflow-x-auto flex-grow-1 d-flex flex-column">
          <!-- サブメニュー -->
          <v-toolbar dense flat class="flex-grow-0">
            <g-checkbox v-model="ellipsis" hide-details label="省略表示" />
          </v-toolbar>
          <!-- 非表示現場存在アラート -->
          <g-placement-alert-hidden-sites />
          <v-divider />
          <!-- 配置表コンテナ -->
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
              <template #employees-col="{ attrs, on }">
                <g-placement-employee-card v-bind="attrs" v-on="on" />
              </template>
              <template #outsourcers-col="{ attrs, on }">
                <g-placement-outsourcer-card
                  v-bind="attrs"
                  color="orange lighten-4"
                  v-on="on"
                />
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
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GPlacementSiteWorkShiftRow from '~/components/organisms/placements/GPlacementSiteWorkShiftRow.vue'
import GPlacementToolbar from '~/components/organisms/placements/GPlacementToolbar.vue'
import GPlacementOutsourcerCard from '~/components/organisms/placements/GPlacementOutsourcerCard.vue'
import GPlacementAlertHiddenSites from '~/components/organisms/placements/GPlacementAlertHiddenSites.vue'
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
    GCheckbox,
    GTemplateDefault,
    GPlacementSiteWorkShiftRow,
    GPlacementToolbar,
    GPlacementOutsourcerCard,
    GPlacementAlertHiddenSites,
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
        this.$store.dispatch('site-order/unsubscribe')
        this.$store.dispatch('assignments/unsubscribe')
        if (!this.from || !this.to) return
        this.$store.dispatch('site-order/subscribe', {
          from: this.from,
          to: this.to,
        })
        this.$store.dispatch('assignments/subscribe', {
          from: this.from,
          to: this.to,
        })
      },
      immediate: true,
    },
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
  methods: {},
}
</script>

<style></style>
