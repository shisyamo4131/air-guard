<template>
  <g-template-default>
    <v-card style="height: 100%" class="d-flex flex-column" tile>
      <!-- ツールバーの表示 -->
      <g-placement-toolbar />
      <!-- メインコンテナ -->
      <div class="d-flex flex-grow-1 overflow-y-hidden pb-12 pb-sm-0">
        <v-sheet class="overflow-x-auto flex-grow-1 d-flex flex-column">
          <!-- サブメニュー -->
          <v-toolbar dense flat class="flex-grow-0">
            <div class="d-flex align-center" style="gap: 16px">
              <v-select
                v-model="length"
                :items="[
                  { text: '3日', value: 3 },
                  { text: '7日', value: 7 },
                  { text: '14日', value: 14 },
                ]"
                style="max-width: 96px"
                label="表示日数"
                hide-details
                solo
                dense
                :menu-props="{ offsetY: true }"
              />
              <g-checkbox v-model="ellipsis" hide-details label="省略表示" />
              <g-checkbox
                v-model="mode"
                hide-details
                label="確認モード"
                true-value="confirmation"
                false-value="placement"
              />
            </div>
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
              :mode="mode"
            >
              <template #site-row="{ attrs, on }">
                <g-placement-site-work-shift-row v-bind="attrs" v-on="on" />
              </template>
              <template #employees-col="{ attrs, on }">
                <g-placement-employee-card-v-2 v-bind="attrs" v-on="on" />
              </template>
              <template #outsourcers-col="{ attrs, on }">
                <g-placement-outsourcer-card-v-2 v-bind="attrs" v-on="on" />
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
import GPlacementTable from '~/components/organisms/placements/GPlacementTable.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GPlacementSiteWorkShiftRow from '~/components/organisms/placements/GPlacementSiteWorkShiftRow.vue'
import GPlacementToolbar from '~/components/organisms/placements/GPlacementToolbar.vue'
import GPlacementAlertHiddenSites from '~/components/organisms/placements/GPlacementAlertHiddenSites.vue'
import GPlacementEmployeeCardV2 from '~/components/organisms/placements/GPlacementEmployeeCardV2.vue'
import GPlacementOutsourcerCardV2 from '~/components/organisms/placements/GPlacementOutsourcerCardV2.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'PlacementsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GPlacementTable,
    GCheckbox,
    GTemplateDefault,
    GPlacementSiteWorkShiftRow,
    GPlacementToolbar,
    GPlacementAlertHiddenSites,
    GPlacementEmployeeCardV2,
    GPlacementOutsourcerCardV2,
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
      mode: 'confirmation',
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
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},

  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    this.$watch(
      () => [this.currentDate, this.length],
      () => {
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
      { immediate: true }
    )
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
