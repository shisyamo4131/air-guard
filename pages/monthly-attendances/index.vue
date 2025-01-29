<script>
/**
 * 勤怠実績の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-29
 */
import { getApp } from 'firebase/app'
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import 'dayjs/locale/ja'
// import GDataTableMonthlyAttendances from '~/components/molecules/tables/GDataTableMonthlyAttendances.vue'
import MonthlyAttendance from '~/models/MonthlyAttendance'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
import GPagination from '~/components/atoms/paginations/GPagination.vue'

export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'MonthlyAttendancesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    // GDataTableMonthlyAttendances,
    GTemplateDefault,
    GDialogMonthPicker,
    GPagination,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      listener: new MonthlyAttendance(),
      loading: false,
      month: this.$dayjs().format('YYYY-MM'),
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    isCalculating() {
      return this.$store.state.systems.calcAttendance?.status !== 'ready'
    },
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
     * freee 用の csv ファイルをダウンロードします。
     * - data.items 配列内の MonthlyAttendance ドキュメントのについて
     *   インスタンスが保有する toFreee を使用して freee 用のデータを生成します。
     */
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

    /**
     * 全従業員の月間勤怠実績を更新します。
     */
    async recalc() {
      this.unsubscribe()
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
        this.subscribe()
        this.loading = false
      }
    },

    /**
     * 月間勤務実績ドキュメントへの購読を開始します。
     */
    subscribe() {
      this.items = this.listener.subscribeDocs([
        ['where', 'month', '==', this.month],
      ])
    },

    /**
     * 月間勤務実績ドキュメントへの購読を解除します。
     */
    unsubscribe() {
      this.listener.unsubscribe()
    },
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container :style="{ height: `${height}px` }">
      <air-array-manager :items="items" height="100%">
        <template #default="props">
          <v-sheet class="d-flex flex-column" height="100%">
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
              <v-toolbar-items>
                <v-btn
                  :disabled="isCalculating || loading"
                  :loading="isCalculating || loading"
                  text
                  @click="recalc"
                  ><v-icon left>mdi-reload</v-icon>実績更新</v-btn
                >
                <v-btn
                  :disabled="isCalculating || loading"
                  :loading="isCalculating || loading"
                  text
                  @click="downloadCsv"
                  ><v-icon left>mdi-download</v-icon>CSV出力</v-btn
                >
              </v-toolbar-items>
            </v-toolbar>
            <div class="flex-table-container">
              <v-skeleton-loader
                v-if="isCalculating"
                class="flex-grow-1"
                type="table"
              />
              <v-data-table
                v-else
                v-bind="props.table.attrs"
                fixed-header
                :headers="[
                  { text: 'CODE', value: 'employee.code' },
                  {
                    text: '従業員',
                    value: 'employee.fullName',
                    sortable: false,
                  },
                  {
                    text: '所定内労働日数',
                    value: 'totalScheduledWorkingDays',
                    align: 'right',
                  },
                  {
                    text: '法定内残業時間',
                    value: 'statutoryOvertimeMinutes',
                    align: 'right',
                  },
                  {
                    text: '法定外残業時間',
                    value: 'nonStatutoryOvertimeMinutes',
                    align: 'right',
                  },
                  {
                    text: '休日労働時間',
                    value: 'holidayWorkingMinutes',
                    align: 'right',
                  },
                  {
                    text: '時間外合計',
                    value: 'overtimeTotal',
                    align: 'right',
                  },
                ]"
                hide-default-footer
                @click:row="
                  $router.push(`/monthly-attendances/${$event.docId}`)
                "
                v-on="props.table.on"
              >
                <template #[`item.employee.code`]="{ item }">
                  {{ $store.getters['employees/get'](item.employeeId).code }}
                </template>
                <template #[`item.employee.fullName`]="{ item }">
                  {{
                    $store.getters['employees/get'](item.employeeId).fullName
                  }}
                </template>
                <template #[`item.totalScheduledWorkingDays`]="{ item }">
                  {{ `${item.totalScheduledWorkingDays} 日` }}
                </template>
                <template #[`item.statutoryOvertimeMinutes`]="{ item }">
                  {{ `${(item.statutoryOvertimeMinutes / 60).toFixed(1)} H` }}
                </template>
                <template #[`item.nonStatutoryOvertimeMinutes`]="{ item }">
                  {{
                    `${(item.nonStatutoryOvertimeMinutes / 60).toFixed(1)} H`
                  }}
                </template>
                <template #[`item.holidayWorkingMinutes`]="{ item }">
                  {{ `${(item.holidayWorkingMinutes / 60).toFixed(1)} H` }}
                </template>
                <template #[`item.overtimeTotal`]="{ item }">
                  {{
                    `${(
                      (item.nonStatutoryOvertimeMinutes +
                        item.holidayWorkingMinutes) /
                      60
                    ).toFixed(1)} H`
                  }}
                </template>
              </v-data-table>
            </div>
            <g-pagination
              v-bind="props.pagination.attrs"
              v-on="props.pagination.on"
            />
          </v-sheet>
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
