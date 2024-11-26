<template>
  <g-template-default>
    <v-card style="height: 100%" class="d-flex flex-column" tile>
      <!-- ツールバーの表示 -->
      <g-placement-toolbar :columns="columns" />
      <!-- メインコンテナ -->
      <div class="d-flex flex-grow-1 overflow-y-hidden pb-12 pb-sm-0">
        <v-sheet class="overflow-x-auto flex-grow-1 d-flex flex-column">
          <!-- サブメニュー -->
          <v-toolbar dense flat class="flex-grow-0">
            <v-btn
              :color="ellipsis ? 'primary' : 'grey darken-1'"
              text
              @click="ellipsis = !ellipsis"
            >
              <v-icon :left="!$vuetify.breakpoint.mobile"
                >mdi-image-size-select-small</v-icon
              >
              <span v-if="!$vuetify.breakpoint.mobile">省略表示</span>
            </v-btn>
            <v-btn
              :color="mode !== 'placement' ? 'primary' : 'grey darken-1'"
              text
              @click="
                mode === 'placement'
                  ? (mode = 'confirmation')
                  : (mode = 'placement')
              "
            >
              <v-icon :left="!$vuetify.breakpoint.mobile"
                >mdi-account-check</v-icon
              >
              <span v-if="!$vuetify.breakpoint.mobile">確認モード</span>
            </v-btn>

            <!-- [権限トラップ] 未上番抽出スイッチ -->
            <div v-if="$store.getters['auth/roles'].includes('manager')">
              <g-switch
                v-show="mode === 'confirmation'"
                v-model="onlyNonArrival"
                class="ml-2"
                hide-details
                label="未上番表示"
              />
            </div>
            <!-- ジャンプボタン -->
            <v-dialog v-model="dialog.jump" max-width="480" scrollable>
              <template #activator="{ attrs, on }">
                <v-btn v-bind="attrs" color="primary" text v-on="on">
                  <v-icon :left="!$vuetify.breakpoint.mobile"
                    >mdi-target</v-icon
                  >
                  <span v-if="!$vuetify.breakpoint.mobile">ジャンプ</span>
                </v-btn>
              </template>
              <v-card>
                <v-toolbar color="secondary" dark dense flat>
                  <v-toolbar-title>ジャンプ</v-toolbar-title>
                  <v-spacer />
                  <g-btn-cancel-icon @click="dialog.jump = false" />
                </v-toolbar>
                <v-card-text ref="jump-container" class="pa-2">
                  <v-list-item
                    v-for="(order, index) in $store.state['site-order'].data"
                    :key="index"
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        <g-chip-work-shift :value="order.workShift" small />
                        {{
                          $store.getters['site-order/site'](order.siteId)
                            ?.name || 'N/A'
                        }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-icon>
                      <v-icon
                        color="primary"
                        class="handle"
                        @click="onClickJump(order.id)"
                        >mdi-arrow-right-bold-circle</v-icon
                      >
                    </v-list-item-icon>
                  </v-list-item>
                </v-card-text>
              </v-card>
            </v-dialog>

            <v-spacer />

            <!-- 表示日数切替 -->
            <v-select
              v-if="mode === 'placement'"
              v-model="length"
              :items="[
                { text: '3日', value: 3 },
                { text: '7日', value: 7 },
                { text: '14日', value: 14 },
              ]"
              style="max-width: 96px"
              label="表示日数"
              hide-details
              solo-inverted
              flat
              dense
              :menu-props="{ offsetY: true }"
            />
          </v-toolbar>
          <!-- 非表示現場存在アラート -->
          <g-placement-alert-hidden-sites />
          <v-divider />
          <!-- 配置表コンテナ -->
          <div class="overflow-hidden d-flex flex-grow-1">
            <g-placement-table
              id="placement-table"
              ref="placement-table"
              class="flex-table"
              :current-date="currentDate"
              :ellipsis="ellipsis"
              :length="length"
              :mode="mode"
              :only-non-arrival="onlyNonArrival"
              @columns="columns = $event"
            >
              <template #site-row="{ attrs, on }">
                <g-placement-site-work-shift-row v-bind="attrs" v-on="on" />
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
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GPlacementSiteWorkShiftRow from '~/components/organisms/placements/GPlacementSiteWorkShiftRow.vue'
import GPlacementToolbar from '~/components/organisms/placements/GPlacementToolbar.vue'
import GPlacementAlertHiddenSites from '~/components/organisms/placements/GPlacementAlertHiddenSites.vue'
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
import GChipWorkShift from '~/components/atoms/chips/GChipWorkShift.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
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
    GTemplateDefault,
    GPlacementSiteWorkShiftRow,
    GPlacementToolbar,
    GPlacementAlertHiddenSites,
    GBtnCancelIcon,
    GChipWorkShift,
    GSwitch,
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
      mode: 'placement',
      columns: [],
      onlyNonArrival: false,

      dialog: {
        jump: false,
      },
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
      return this.$dayjs(this.currentDate)
        .subtract(1, 'day')
        .format('YYYY-MM-DD')
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
  watch: {
    'dialog.jump'(v) {
      if (v) return
      this.$vuetify.goTo(this, { container: this.$refs['jump-container'] })
    },
    mode(v) {
      if (v === 'placement') this.onlyNonArrival = false
    },
  },

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
  methods: {
    /**
     * ジャンプアイコンがクリックされた時の処理です。
     * 受け取った引数（siteWorkShiftId）を基に GPlacementTable の scroll を実行します。
     */
    onClickJump(id) {
      this.dialog.jump = false
      this.$refs['placement-table'].scroll(id)
    },
  },
}
</script>

<style></style>
