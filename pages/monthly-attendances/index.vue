<script>
/**
 * ## pages.monthly-attendances.index
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-15 - 初版作成
 */
import { getApp } from 'firebase/app'
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
import GDataTableMonthlyAttendances from '~/components/molecules/tables/GDataTableMonthlyAttendances.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import MonthlyAttendance from '~/models/MonthlyAttendance'
import GCalendarDailyAttendances from '~/components/molecules/calendars/GCalendarDailyAttendances.vue'
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'

export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'MonthlyAttendancesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateIndex,
    GDialogMonthPicker,
    GDataTableMonthlyAttendances,
    GCalendarDailyAttendances,
    GBtnCancelIcon,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      items: [],
      listener: new MonthlyAttendance(),
      loading: false,
      month: this.$dayjs().format('YYYY-MM'),
      selectedAttendance: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    currentDate() {
      if (!this.selectedAttendance) return this.$dayjs().format('YYYY-MM-DD')
      return this.$dayjs(`${this.selectedAttendance.month}-01`).format(
        'YYYY-MM-DD'
      )
    },
    dailyAttendances() {
      return this.selectedAttendance?.dailyAttendances || []
    },
    employeeLabel() {
      if (!this.selectedAttendance) return null
      const employeeId = this.selectedAttendance.employeeId
      const result = this.$store.getters['employees/get'](employeeId).abbr
      return result
    },
    isCalculating() {
      return this.$store.state.systems.calcAttendance.status !== 'ready'
    },
    monthLabel() {
      if (!this.selectedAttendance) return null
      const result = this.$dayjs(`${this.month}-01`).format('YYYY年MM月')
      return result
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    isCalculating: {
      handler(v) {
        if (!v) {
          this.subscribe()
        } else {
          this.listener.unsubscribe()
        }
      },
      immediate: true,
    },
    month: {
      handler(v) {
        this.items.splice(0)
        if (!v) this.listener.unsubscribe()
        this.subscribe()
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.listener.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickRow(item) {
      this.selectedAttendance = item
      this.dialog = true
    },
    subscribe() {
      this.items = this.listener.subscribeDocs([
        ['where', 'month', '==', this.month],
      ])
    },
    async recalc() {
      try {
        const firebaseApp = getApp()
        const functions = getFunctions(firebaseApp, 'asia-northeast1')
        if (process.env.NODE_ENV === 'local') {
          connectFunctionsEmulator(functions, 'localhost', 5001)
        }
        const func = httpsCallable(
          functions,
          'maintenance-refreshMonthlyAttendances'
        )
        const result = await func({ month: this.month })
        console.info(result.data.message) // eslint-disable-line no-console
      } catch (err) {
        console.error('Error calling function:', err) // eslint-disable-line no-console
      }
    },
  },
}
</script>

<template>
  <g-template-index :items="items" :hide-pagination="isCalculating">
    <template #search>
      <g-dialog-month-picker v-model="month">
        <template #activator="{ attrs, on }">
          <v-text-field
            v-bind="attrs"
            class="center-input"
            style="max-width: 120px"
            flat
            solo-inverted
            dense
            hide-details
            :disabled="isCalculating"
            v-on="on"
          />
        </template>
      </g-dialog-month-picker>
      <v-btn
        color="primary"
        :disabled="loading"
        :loading="isCalculating"
        @click="recalc"
        >実績更新</v-btn
      >
      <v-spacer />
    </template>
    <template #default="{ attrs, on }">
      <v-skeleton-loader
        v-if="isCalculating"
        class="flex-grow-1"
        type="table"
      />
      <g-data-table-monthly-attendances
        v-else
        v-bind="attrs"
        @click:row="onClickRow"
        v-on="on"
      />
      <v-dialog
        v-model="dialog"
        scrollable
        max-width="960"
        :fullscreen="$vuetify.breakpoint.mobile"
      >
        <v-card>
          <v-card-title class="justify-space-between">
            <div>{{ employeeLabel }}</div>
            <div>{{ monthLabel }}</div>
          </v-card-title>
          <v-card-text>
            <g-calendar-daily-attendances
              :value="currentDate"
              :items="dailyAttendances"
            />
          </v-card-text>
          <v-card-actions class="justify-end">
            <g-btn-cancel-icon @click="dialog = false" />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </g-template-index>
</template>

<style></style>
