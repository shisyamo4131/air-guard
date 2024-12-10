<script>
/**
 * ## GInputWorkRegulation
 *
 * @author shisayamo4131
 */
import { get, ref } from 'firebase/database'
import { database } from 'air-firebase'
import GCardInputForm from '../cards/GCardInputForm.vue'
import GCalendar from '../../atoms/calendars/GCalendar.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import WorkRegulation from '~/models/WorkRegulation'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextarea,
    GNumeric,
    GTextField,
    GCheckbox,
    GCardInputForm,
    GSelect,
    GCalendar,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GInputSubmitMixin],
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    instance: {
      type: Object,
      required: true,
      validator(instance) {
        return instance instanceof WorkRegulation
      },
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      calendarDate: null,
      days: [
        { text: '月曜日', value: 'mon' },
        { text: '火曜日', value: 'tue' },
        { text: '水曜日', value: 'wed' },
        { text: '木曜日', value: 'thu' },
        { text: '金曜日', value: 'fri' },
        { text: '土曜日', value: 'sat' },
        { text: '日曜日', value: 'sun' },
      ],
      editModel: new WorkRegulation(),
      /**
       * 所定労働に関するルールです。
       * - 所定労働日は1つ以上選択されていなければなりません。
       * - 所定労働時間は週40時間（2400分）以内でなければなりません。
       */
      rules: {
        length: (v) => !!v.length || '1つ以上選択してください',
        overTime: (v) =>
          this.editModel.scheduledWorkMinutes *
            this.editModel.scheduledWorkDays.length <=
            2400 || '週の所定労働時間が40時間を超過しています',
        allDays: (v) =>
          this.editModel.scheduledWorkDays.length < 7 ||
          '全曜日を所定労働日にすることはできません',
      },
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    calendarMonth() {
      return this.calendarDate
        ? this.$dayjs(this.calendarDate).format('MM')
        : null
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * 適用年度が変更されたらカレンダーの日付を変更する
     */
    'editModel.year': {
      handler(v) {
        const date = this.$dayjs(`${v}-01-01`)
        this.calendarDate = date.isValid ? date.format('YYYY-MM-DD') : undefined
      },
      immediate: true,
    },

    startTime(v) {
      this.$refs.scheduledWorkDays.validate()
    },

    endTime(v) {
      this.$refs.scheduledWorkDays.validate()
    },

    breakMinutes(v) {
      this.$refs.scheduledWorkDays.validate()
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onInputScheduledWorkingDays(arr) {
      this.editModel.legalHoliday = ''
      const result = arr.sort(
        (a, b) =>
          this.days.findIndex((day) => day.value === a) -
          this.days.findIndex((day) => day.value === b)
      )
      this.editModel.scheduledWorkDays = result
    },

    /**
     * 設定されている祝日を初期化します。
     */
    refreshHolidays() {
      this.editModel.holidays.splice(0)
    },

    /**
     * Realtime Database から現在の年度の祝日を取得し、
     * editModel.holidays にセットします。
     */
    async syncHolidayFromDatabase() {
      const dbRef = ref(database, `/Holidays/${this.editModel.year}`)
      const snapshot = await get(dbRef)
      this.editModel.holidays = snapshot.exists()
        ? Object.values(snapshot.val()).flatMap((monthData) =>
            Object.values(monthData).map((entry) => {
              return {
                date: entry.date,
                name: entry.name,
              }
            })
          )
        : []
    },
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="就業規則編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-row dense>
      <v-col cols="12" md="3">
        <g-text-field
          v-model="editModel.year"
          class="center-input"
          label="適用年度"
          :disabled="editMode !== CREATE"
          :rules="[(v) => !v || v.length === 4 || '西暦で入力']"
          required
          suffix="年"
          @change="refreshHolidays"
        />
      </v-col>

      <v-col cols="12" md="9">
        <g-text-field
          v-model="editModel.name"
          label="就業規則名"
          required
          hint="'正社員'、'契約社員'など"
          persistent-hint
        />
      </v-col>
      <v-col cols="12">
        <g-select
          v-model="editModel.contractType"
          label="雇用形態"
          :items="$CONTRACT_TYPE_ARRAY"
          required
          attach
        />
      </v-col>
      <v-col cols="12">
        <g-text-field
          v-model="editModel.initialWorkLocation"
          label="就業場所（雇い入れ直後）"
          required
        />
      </v-col>
      <v-col cols="12">
        <g-text-field
          v-model="editModel.locationChangeScope"
          label="就業場所（変更の範囲）"
          required
        />
      </v-col>
      <v-col cols="12">
        <g-text-field
          v-model="editModel.initialJob"
          label="従事すべき業務の内容（雇い入れ直後）"
          required
        />
      </v-col>
      <v-col cols="12">
        <g-text-field
          v-model="editModel.jobChangeScope"
          label="従事すべき業務の内容（変更の範囲）"
          required
        />
      </v-col>
      <v-col cols="12" sm="4">
        <g-text-field
          v-model="editModel.startTime"
          class="center-input"
          label="始業時刻"
          required
          input-type="time"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <g-text-field
          v-model="editModel.endTime"
          class="center-input"
          label="終業時刻"
          required
          input-type="time"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <g-numeric
          v-model="editModel.breakMinutes"
          class="center-input"
          label="休憩時間"
          required
          suffix="分"
        />
      </v-col>
      <v-col cols="12">
        <g-checkbox
          v-model="editModel.hasOvertime"
          class="mt-0"
          label="所定時間外労働の有無"
        />
      </v-col>
      <v-col cols="12">
        <v-card outlined class="flex-grow-1 mb-6">
          <v-card-text>
            <h4>所定労働日</h4>
            <v-input
              ref="scheduledWorkDays"
              v-model="editModel.scheduledWorkDays"
              :rules="[rules.length, rules.overTime, rules.allDays]"
              hint="必ず就業する曜日を選択します"
              persistent-hint
            >
              <v-chip-group
                v-model="editModel.scheduledWorkDays"
                active-class="primary--text"
                column
                multiple
                @change="onInputScheduledWorkingDays"
              >
                <v-chip
                  v-for="day of days"
                  :key="day.value"
                  :value="day.value"
                  outlined
                  small
                >
                  {{ day.text }}
                </v-chip>
              </v-chip-group>
            </v-input>
            <g-checkbox
              v-model="editModel.isHolidayWorkDay"
              label="祝日を所定労働日とする"
            />
            <h4>法定休日</h4>
            <v-chip-group
              v-model="editModel.legalHoliday"
              active-class="primary--text"
              column
              mandatory
            >
              <v-chip
                v-for="day of days"
                :key="day.value"
                :value="day.value"
                :disabled="editModel.scheduledWorkDays.includes(day.value)"
                outlined
                small
              >
                {{ day.text }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <g-numeric
          v-model="editModel.averageMonthlyScheduledWorkDays"
          class="center-input"
          label="月平均所定日数"
          required
          decimal-places="2"
          suffix="日／月"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <g-numeric
          v-model="editModel.overtimePayRate"
          class="center-input"
          label="時間外割増"
          required
          suffix="％"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <g-numeric
          v-model="editModel.holidayPayRate"
          class="center-input"
          label="休日割増"
          required
          suffix="％"
        />
      </v-col>
      <v-col cols="12">
        <g-checkbox
          v-model="editModel.bonusEligibility"
          class="mt-0"
          label="賞与対象"
        />
      </v-col>
      <v-col cols="12">
        <v-expand-transition>
          <div v-show="!editModel.isHolidayWorkDay">
            <h4>祝日登録</h4>
            <!-- editModel.year 以外の日付は選択不可 -->
            <g-calendar
              ref="calendar"
              v-model="calendarDate"
              style="height: 480px"
              class="mb-6"
              :disable-prev="!calendarMonth || calendarMonth === '01'"
              :disable-next="!calendarMonth || calendarMonth === '12'"
              :events="
                editModel.holidays.map((holiday) => ({
                  start: holiday.date || holiday,
                  name: holiday.name || 'N/A',
                  color: 'error',
                }))
              "
              hide-today-btn
            >
              <template #append-toolbar>
                <v-spacer />
                <v-btn color="primary" small @click="syncHolidayFromDatabase"
                  >祝日設定から引用</v-btn
                >
              </template>
            </g-calendar>
          </div>
        </v-expand-transition>
      </v-col>
      <v-col cols="12">
        <g-textarea v-model="editModel.remarks" label="備考" hide-details />
      </v-col>
    </v-row>
  </g-card-input-form>
</template>

<style></style>
