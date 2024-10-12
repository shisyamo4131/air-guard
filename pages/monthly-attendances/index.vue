<template>
  <g-template-index :items="items">
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
            v-on="on"
          />
        </template>
      </g-dialog-month-picker>
      <v-btn :disabled="loading" :loading="loading" @click="recalc"
        >実績更新</v-btn
      >
      <v-spacer />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-monthly-attendances
        v-bind="attrs"
        @click:row="onClickRow"
        v-on="on"
      />
      <v-dialog v-model="dialog" scrollable>
        <v-card>
          <v-card-text class="pa-0 d-flex flex-grow-1" style="height: 480px">
            <g-data-table-daily-attendances
              class="flex-table"
              :items="dailyAttendances"
            />
          </v-card-text>
        </v-card>
      </v-dialog>
    </template>
  </g-template-index>
</template>

<script>
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
import GDataTableDailyAttendances from '~/components/molecules/tables/GDataTableDailyAttendances.vue'
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
    GDataTableDailyAttendances,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      dailyAttendances: [],
      items: [],
      listener: new MonthlyAttendance(),
      loading: false,
      month: this.$dayjs().format('YYYY-MM'),
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (v) return
      this.dailyAttendances.splice(0)
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
      this.dailyAttendances = item.dailyAttendances
      this.dialog = true
    },
    subscribe() {
      this.items = this.listener.subscribeDocs([
        ['where', 'month', '==', this.month],
      ])
    },
    async recalc() {
      this.listener.unsubscribe()
      this.loading = true
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
      } finally {
        this.loading = false
        this.subscribe()
      }
    },
  },
}
</script>

<style></style>
