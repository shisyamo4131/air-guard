<script>
/**
 * 従業員月間勤怠実績の詳細画面です。
 * @author shisyamo4131
 * @refact 2025-01-22
 */
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GBtnCancel from '~/components/atoms/btns/GBtnCancel.vue'
import GCalendarDailyAttendances from '~/components/molecules/calendars/GCalendarDailyAttendances.vue'
import GInputLeaveRecord from '~/components/molecules/inputs/GInputLeaveRecord.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import DailyAttendance from '~/models/DailyAttendance'
import Employee from '~/models/Employee'
import LeaveRecord from '~/models/LeaveRecord'
import MonthlyAttendance from '~/models/MonthlyAttendance'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'MonthlyAttendanceDetail',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCalendarDailyAttendances,
    GTemplateDefault,
    AirArrayManager,
    GInputLeaveRecord,
    GBtnCancel,
  },

  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app, route }) {
    const docId = route.params.docId
    const [employeeId, year, month] = docId.split('-')
    const currentDate = `${year}-${month}-01`
    return { docId, currentDate, employeeId, year, month }
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      // コンポーネントで管理するデータモデルのインスタンスです。
      instance: {
        daily: new DailyAttendance(),
        leave: new LeaveRecord(),
        monthly: new MonthlyAttendance(),
      },

      // カレンダー上で選択された日（YYYY-MM-DD）です。
      selectedDate: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * 前月、当月、翌月の勤怠実績をまとめて返します。
     */
    allAttendances() {
      const current = this.instance.monthly.dailyAttendances || []
      const prev = this.instance.monthly.dailyAttendancesPrev || []
      const next = this.instance.monthly.dailyAttendancesNext || []
      return current.concat(prev, next)
    },

    /**
     * 休暇情報で振替休日が選択された際に選択可能な日を判定する関数を返します
     */
    allowedDatesForSubstitute() {
      const func = (date) => {
        // カレンダー上で選択された日がなければ false を返す
        if (!this.selectedDate) return false

        // 選択された日（selectedDate）日を含む週の開始日と終了日を取得
        const selectedDate = this.$dayjs(this.selectedDate)
        const from = selectedDate.startOf('week').format('YYYY-MM-DD')
        const to = selectedDate.endOf('week').format('YYYY-MM-DD')

        // 期間外であれば対象外
        if (date < from || date > to) return false

        // 引数で指定された日の日次勤怠実績を取得 -> 取得できなければ false を返す
        const dailyAttendance = this.allAttendances.find(
          (attendance) => attendance.date === date
        )
        if (!dailyAttendance) return false

        const { attendanceStatus, dayType } = dailyAttendance

        // 日次勤怠実績が `present` でなければ false を返す
        if (attendanceStatus !== 'present') return false

        // 日次勤怠実績の日区分が法定外休日または法定休日でなければ false を返す
        if (!['non-statutory-holiday', 'legal-holiday'].includes(dayType))
          return false

        return true
      }
      return func
    },

    /**
     * 従業員情報を Vuex から取得して返します。
     * - Vuex から取得できなかった場合は空の Employee インスタンスを返します。
     */
    employee() {
      return (
        this.$store.getters['employees/get'](this.employeeId) || new Employee()
      )
    },

    /**
     * カレンダー上で選択された日の休暇実績データを返します。
     * - 日が未選択の場合 undefined を返します。
     * - 該当する日の休暇実績データが存在しない場合 undefined を返します。
     */
    leaveRecord() {
      if (!this.selectedDate) return undefined
      return this.leaveRecords.find(({ date }) => date === this.selectedDate)
    },

    /**
     * 当月分の月間勤怠実績ドキュメントが保有する日次勤怠実績データから
     * 休暇実績データを返します。
     * - leaveRecord プロパティを配列として返しますが、docId がないデータは無視されます。
     * - 振替休日の場合、振替出勤日の日次勤怠実績にも同一の休暇実績が保存されているため
     *   これを省いていします。
     */
    leaveRecords() {
      return this.instance.monthly.dailyAttendances
        .filter(({ date, leaveRecord }) => {
          return leaveRecord.docId && date === leaveRecord.date
        })
        .map((attendance) => {
          return attendance.leaveRecord
        })
      // .filter(({ docId }) => docId)
    },

    /**
     * 勤怠実績詳細を配列で返します。
     */
    operationWorkResults() {
      const dailyAttendances = this.instance.monthly.dailyAttendances
      return dailyAttendances
        .map(({ operationWorkResults }) => operationWorkResults)
        .flat()
    },

    /**
     * カレンダー上で選択された日の日次勤怠実績データを返します。
     * - 日が未選択の場合 undefined を返します。
     * - 該当する日の日次勤怠実績データが存在しない場合 undefined を返します。
     * NOTE:
     * 日次勤怠実績はその日の勤怠が存在しない場合もドキュメントとしては作成されています。
     * attendanceStatus が `present` であるもののみを返します。
     */
    presentAttendance() {
      if (!this.selectedDate) return undefined
      return this.allAttendances.find(({ date, attendanceStatus }) => {
        return date === this.selectedDate && attendanceStatus === 'present'
      })
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},

  /***************************************************************************
   * CREATED / DESTROYED
   ***************************************************************************/
  created() {
    // 月間勤怠実績ドキュメントの購読を開始します。
    this.instance.monthly.subscribe(this.docId)

    // 休暇実績インスタンスの従業員IDを初期化します。
    this.instance.leave.employeeId = this.employeeId
  },

  destroyed() {
    this.instance.monthly.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * カレンダーの日が選択された時の処理です。
     * 1. 選択された日の出勤実績がある場合は日次勤怠実績のダイアログを開きます。
     * 2. 選択された日の休暇実績がある場合は休暇実績編集ダイアログを `変更` モードで開きます。
     * 3. 休暇実績もない場合は休暇実績編集ダイアログを `登録` モードで開きます。
     */
    onClickDate(event) {
      this.selectedDate = event.date
      if (this.presentAttendance) {
        this.$refs['daily-manager'].toUpdate(this.presentAttendance)
      } else if (this.leaveRecord) {
        this.$refs['leave-record-manager'].toUpdate(this.leaveRecord)
      } else {
        this.instance.leave.date = event.date
        this.$refs['leave-record-manager'].toRegist()
      }
    },
  },
}
</script>

<template>
  <g-template-default>
    <v-container fluid>
      <v-card>
        <v-card-title>
          {{ `${year}年${month}月 勤怠実績` }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            :value="`【${employee.code}】${employee.fullName}`"
            label="従業員"
            readonly
          />
        </v-card-text>
        <v-container fluid>
          <v-row>
            <v-col cols="9">
              <!-- 勤怠実績管理 -->
              <air-array-manager
                ref="daily-manager"
                :dialog-props="{ maxWidth: 720 }"
                disable-delete
                :items="allAttendances"
                label="勤怠実績"
                :schema="instance.daily"
              >
                <template #default="{ table }">
                  <g-calendar-daily-attendances
                    :value="currentDate"
                    v-bind="table.attrs"
                    @click:date="onClickDate"
                  />
                </template>
                <template #card="{ attrs, color, on, inputs }">
                  <v-card v-bind="attrs">
                    <v-toolbar :color="color" dark flat>
                      <v-toolbar-title>
                        {{ selectedDate }}
                      </v-toolbar-title>
                      <v-spacer />
                      <g-btn-cancel icon @click="on['cancel']" />
                    </v-toolbar>
                    <v-card-text class="pt-5">
                      <v-text-field
                        label="勤務日"
                        :value="inputs.attrs.date"
                        readonly
                      />
                      <v-text-field
                        label="勤怠結果"
                        :value="
                          $ATTENDANCE_STATUS[inputs.attrs.attendanceStatus].full
                        "
                        readonly
                      />
                      <v-text-field
                        label="始業時刻"
                        :value="$dayjs(inputs.attrs.startTime).format('HH:mm')"
                        readonly
                      />
                      <v-text-field
                        label="終業時刻"
                        :value="$dayjs(inputs.attrs.endTime).format('HH:mm')"
                        readonly
                      />
                      <v-text-field
                        label="休憩時間"
                        :value="inputs.attrs.breakMinutes"
                        readonly
                      />
                      <v-data-table
                        :headers="[
                          { text: '開始', value: 'startTime' },
                          { text: '終了', value: 'endTime' },
                          { text: '休憩', value: 'breakMinutes' },
                          { text: '現場', value: 'siteId' },
                        ]"
                        :items="inputs.attrs.operationWorkResults"
                        sort-by="startTime"
                      >
                        <template #[`item.siteId`]="{ item }">
                          {{
                            $store.getters['sites/get'](item.siteId).abbr ||
                            'N/A'
                          }}
                        </template>
                      </v-data-table>
                    </v-card-text>
                  </v-card>
                </template>
              </air-array-manager>
            </v-col>
            <v-col cols="3">
              <v-card flat>
                <v-container fluid>
                  <v-text-field
                    :value="instance.monthly.totalWorkingDays"
                    label="勤務日数"
                    dense
                    readonly
                  />
                  <v-text-field
                    :value="instance.monthly.totalWorkingMinutes"
                    label="総労働時間"
                    dense
                    readonly
                  />
                  <v-text-field
                    :value="instance.monthly.totalScheduledWorkDays"
                    label="所定労働日数"
                    dense
                    readonly
                  />
                  <v-text-field
                    :value="instance.monthly.totalScheduledWorkingDays"
                    label="所定内労働日数"
                    dense
                    readonly
                  />
                  <v-text-field
                    :value="instance.monthly.totalNonScheduledWorkingDays"
                    label="所定休日労働日数"
                    dense
                    readonly
                  />
                  <v-text-field
                    :value="instance.monthly.holidayWorkingDays"
                    label="休日労働日数"
                    dense
                    readonly
                  />
                  <v-text-field
                    :value="instance.monthly.holidayWorkingMinutes"
                    label="休日労働時間（分）"
                    dense
                    readonly
                  />
                  <v-text-field
                    :value="instance.monthly.scheduledWorkingMinutes"
                    label="所定内労働時間（分）"
                    dense
                    readonly
                  />
                </v-container>
              </v-card>
            </v-col>
            <v-col cols="12">
              <!-- 稼働実績 -->
              <v-card outlined>
                <v-card-title> 勤怠実績詳細 </v-card-title>
                <v-container fluid>
                  <v-data-table
                    :headers="[
                      { text: '日付', value: 'date' },
                      { text: '始業時刻', value: 'startTime' },
                      { text: '終業時刻', value: 'endTime' },
                      { text: '休憩時間', value: 'breakMinutes' },
                      { text: '現場', value: 'siteId' },
                    ]"
                    hide-default-footer
                    item-key="docId"
                    :items="operationWorkResults"
                    :items-per-page="-1"
                    :sort-by="['date', 'startTime']"
                  >
                    <template #[`item.siteId`]="{ item }">
                      {{
                        $store.getters['sites/get'](item.siteId)?.abbr || 'N/A'
                      }}
                    </template>
                  </v-data-table>
                </v-container>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card>

      <!-- 休暇実績管理 -->
      <air-array-manager
        ref="leave-record-manager"
        :dialog-props="{ maxWidth: 360 }"
        :handle-create="async (item) => await item.create()"
        :handle-update="async (item) => await item.update()"
        :handle-delete="async (item) => await item.delete()"
        height="100%"
        :item-converter="async (item) => await item.fetchDoc(item.docId)"
        :items="leaveRecords"
        label="休暇実績"
        :schema="instance.leave"
      >
        <template #inputs="{ attrs, on }">
          <g-input-leave-record
            v-bind="attrs"
            :allowed-dates-for-substitute="allowedDatesForSubstitute"
            hide-date
            hide-employee
            v-on="on"
          />
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
