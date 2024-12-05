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
import 'dayjs/locale/ja'
import GDataTableMonthlyAttendances from '~/components/molecules/tables/GDataTableMonthlyAttendances.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import MonthlyAttendance from '~/models/MonthlyAttendance'
import GCalendarDailyAttendances from '~/components/molecules/calendars/GCalendarDailyAttendances.vue'
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
import GDataTableOperationWorkResults from '~/components/molecules/tables/GDataTableOperationWorkResults.vue'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GInputLeaveRecord from '~/components/molecules/inputs/GInputLeaveRecord.vue'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import LeaveRecord from '~/models/LeaveRecord'
import GTextFieldSearchMonth from '~/components/molecules/inputs/GTextFieldSearchMonth.vue'

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
    GDataTableMonthlyAttendances,
    GCalendarDailyAttendances,
    GBtnCancelIcon,
    GDataTableOperationWorkResults,
    GDialogInput,
    GInputLeaveRecord,
    GTextFieldSearchMonth,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeProvider],

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: {
        calendar: false,
        leaveRecord: false,
        operationWorkResults: false,
      },
      instance: new LeaveRecord(),
      items: [],
      listener: new MonthlyAttendance(),
      loading: false,
      month: this.$dayjs().format('YYYY-MM'),
      selectedDate: null,
      selectedEmployeeId: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    // 休暇情報で振替休日が選択された際に選択可能な日を判定する関数を返します
    allowedDatesForSubstitute() {
      const func = (date) => {
        // 選択された日（selectedDate）日を含む週の開始日と終了日を取得
        const selectedDate = this.$dayjs(this.selectedDate)
        const from = selectedDate.startOf('week').format('YYYY-MM-DD')
        const to = selectedDate.endOf('week').format('YYYY-MM-DD')

        // 期間外であれば対象外
        if (date < from || date > to) return false

        // 期間内で法定外休日または法定休日である出勤簿を取得
        const substitutable = this.dailyAttendances.find((attendance) => {
          return (
            attendance.date === date &&
            ['non-statutory-holiday', 'legal-holiday'].includes(
              attendance.dayType
            ) &&
            attendance.totalWorkingMinutes > 0
          )
        })

        // 該当する出勤簿が存在するかを判定して返す
        return !!substitutable
      }
      return func
    },
    currentDate() {
      if (!this.monthlyAttendance) return this.$dayjs().format('YYYY-MM-DD')
      return this.$dayjs(`${this.monthlyAttendance.month}-01`).format(
        'YYYY-MM-DD'
      )
    },
    dailyAttendance() {
      return this.dailyAttendances.find(
        ({ date }) => date === this.selectedDate
      )
    },
    dailyAttendances() {
      const current = this.monthlyAttendance?.dailyAttendances || []
      const prev = this.monthlyAttendance?.dailyAttendancesPrev || []
      const next = this.monthlyAttendance?.dailyAttendancesNext || []
      return current.concat(prev, next)
      // return this.monthlyAttendance?.dailyAttendances || []
    },
    dateLabel() {
      if (
        !this.monthlyAttendance ||
        !this.dailyAttendance ||
        !this.dailyAttendance.operationWorkResults?.length
      ) {
        return null
      }
      return this.$dayjs(this.dailyAttendance.operationWorkResults[0].date)
        .locale('ja')
        .format('YYYY年MM月DD日(ddd)')
    },
    employeeLabel() {
      if (!this.monthlyAttendance) return null
      const employeeId = this.monthlyAttendance.employeeId
      const result = this.$store.getters['employees/get'](employeeId).abbr
      return result
    },
    isCalculating() {
      return this.$store.state.systems.calcAttendance?.status !== 'ready'
    },
    monthLabel() {
      if (!this.monthlyAttendance) return null
      const result = this.$dayjs(`${this.month}-01`).format('YYYY年MM月')
      return result
    },
    monthlyAttendance() {
      return this.items.find(
        ({ employeeId }) => employeeId === this.selectedEmployeeId
      )
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    'dialog.leaveRecord'(v) {
      if (!v) {
        this.instance.initialize()
        this.editMode = this.CREATE
      }
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
    downloadCsv() {
      const data = this.items.map((item) => item.toFreee())

      // PapaParseを使ってデータをCSV形式に変換
      const csv = this.$papa.unparse(data)

      // Blobを作成
      const blob = new Blob([csv], { type: 'text/csv:charset=utf-8;' })

      // ダウンロード用のリンクを作成
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'freee.csv')
      document.body.appendChild(link)

      // リンクをクリックしてダウンロードを開始
      link.click()

      // リンクを削除
      document.body.removeChild(link)
    },
    onClickRow(item) {
      this.selectedEmployeeId = item.employeeId
      this.dialog.calendar = true
    },
    onClickDate({ date }) {
      this.selectedDate = date

      // 稼働実績が存在する場合は、稼働実績の詳細ダイアログを開く
      if (
        this.dailyAttendance &&
        this.dailyAttendance.operationWorkResults.length > 0
      ) {
        this.dialog.operationWorkResults = true
      } else if (this.dailyAttendance) {
        // alert('ここから先はまだ開発中です。')
        const { employeeId, date } = this.dailyAttendance
        this.instance.initialize({
          ...this.dailyAttendance.leaveRecord,
          employeeId,
          date,
        })
        this.editMode = this.instance.docId ? this.UPDATE : this.CREATE
        this.dialog.leaveRecord = true
      }
    },
    subscribe() {
      this.items = this.listener.subscribeDocs([
        ['where', 'month', '==', this.month],
      ])
    },
    async recalc() {
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
      }
    },
  },
}
</script>

<template>
  <g-template-index
    label="従業員勤怠"
    :items="items"
    :hide-pagination="isCalculating"
  >
    <template #search>
      <g-text-field-search-month v-model="month" />
      <v-btn
        color="primary"
        :disabled="isCalculating || loading"
        :loading="isCalculating || loading"
        @click="recalc"
        >実績更新</v-btn
      >
      <v-btn
        color="primary"
        :disabled="isCalculating || loading"
        :loading="isCalculating || loading"
        @click="downloadCsv"
        >CSV</v-btn
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
        v-model="dialog.calendar"
        scrollable
        max-width="960"
        :fullscreen="$vuetify.breakpoint.mobile"
      >
        <v-card>
          <v-card-title class="justify-space-between">
            <div>{{ employeeLabel }}</div>
            <div>{{ monthLabel }}</div>
          </v-card-title>
          <v-card-text class="px-0 px-md-6">
            <g-calendar-daily-attendances
              style="height: auto"
              :value="currentDate"
              :items="dailyAttendances"
              @click:date="onClickDate"
            />
            <v-dialog v-model="dialog.operationWorkResults" max-width="960">
              <v-card>
                <v-card-title>
                  <div>{{ dateLabel }}</div>
                </v-card-title>
                <v-card-text class="px-0 px-md-6">
                  <g-data-table-operation-work-results
                    :items="dailyAttendance?.operationWorkResults || []"
                  />
                </v-card-text>
                <v-card-actions class="justify-end">
                  <g-btn-cancel-icon
                    @click="dialog.operationWorkResults = false"
                  />
                </v-card-actions>
              </v-card>
            </v-dialog>
            <g-dialog-input v-model="dialog.leaveRecord" max-width="360">
              <template #default="props">
                <g-input-leave-record
                  v-bind="props.attrs"
                  :allowe-dates-for-substitute="allowedDatesForSubstitute"
                  hide-employee
                  hide-date
                  :edit-mode.sync="editMode"
                  :instance="instance"
                  v-on="props.on"
                />
              </template>
            </g-dialog-input>
          </v-card-text>
          <v-card-actions class="justify-end">
            <g-btn-cancel-icon @click="dialog.calendar = false" />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </g-template-index>
</template>

<style></style>
