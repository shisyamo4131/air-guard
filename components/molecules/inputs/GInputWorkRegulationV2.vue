<script>
/**
 * 就業規則情報の入力コンポーネントです。
 * @author shisayamo4131
 * @refact 2025-01-20
 */
import { get, ref } from 'firebase/database'
import { database } from 'air-firebase'
import GCalendar from '../../atoms/calendars/GCalendar.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import { vueProps } from '~/models/propsDefinition/WorkRegulation'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextarea,
    GNumeric,
    GTextField,
    GCheckbox,
    GSelect,
    GCalendar,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeReceiver],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: vueProps,

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
      /**
       * 所定労働に関するルールです。
       * - 所定労働日は1つ以上選択されていなければなりません。
       * - 所定労働時間は週40時間（2400分）以内でなければなりません。
       */
      rules: {
        length: (v) => !!v.length || '1つ以上選択してください',
        overTime: (v) =>
          this.scheduledWorkMinutes * this.scheduledWorkDays.length <= 2400 ||
          '週の所定労働時間が40時間を超過しています',
        allDays: (v) =>
          this.scheduledWorkDays.length < 7 ||
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

    /**
     * 所定労働日を制御します。
     * get: props.scheduledWorkDays を返します。
     * set: 選択された所定労働日を曜日順にソートし、update イベントを emit します。
     *      法定休日を初期化します。
     */
    computedScheduledWorkDays: {
      get() {
        return this.scheduledWorkDays
      },
      set(v) {
        const result = v.sort(
          (a, b) =>
            this.days.findIndex((day) => day.value === a) -
            this.days.findIndex((day) => day.value === b)
        )
        this.$emit('update:legalHoliday', '')
        this.$emit('update:scheduledWorkDays', result)
      },
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * 適用年度が変更されたらカレンダーの日付を変更する
     */
    year: {
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
    /**
     * 設定されている祝日を初期化します。
     */
    refreshHolidays() {
      this.$emit('holidays', [])
    },

    /**
     * Realtime Database から現在の年度の祝日を取得し、
     * holidays にセットします。
     */
    async syncHolidayFromDatabase() {
      if (!this.year) return
      const dbRef = ref(database, `/Holidays/${this.year}`)
      const snapshot = await get(dbRef)
      const result = snapshot.exists()
        ? Object.values(snapshot.val()).flatMap((monthData) =>
            Object.values(monthData).map((entry) => {
              return {
                date: entry.date,
                name: entry.name,
              }
            })
          )
        : []

      this.$emit('update:holidays', result)
    },
  },
}
</script>

<template>
  <div>
    <v-row dense>
      <v-col cols="12" md="3">
        <g-text-field
          :value="year"
          class="center-input"
          label="適用年度"
          :disabled="editMode !== CREATE"
          :rules="[(v) => !v || v.length === 4 || '西暦で入力']"
          required
          suffix="年"
          @input="$emit('update:year', $event)"
          @change="refreshHolidays"
        />
      </v-col>

      <v-col cols="12" md="9">
        <g-text-field
          :value="name"
          label="就業規則名"
          required
          hint="'正社員'、'契約社員'など"
          persistent-hint
          @input="$emit('update:name', $event)"
        />
      </v-col>
      <v-col cols="12">
        <g-select
          :value="contractType"
          label="雇用形態"
          :items="$CONTRACT_TYPE_ARRAY"
          required
          attach
          @input="$emit('update:contractType', $event)"
        />
      </v-col>
      <v-col cols="12">
        <g-text-field
          :value="initialWorkLocation"
          label="就業場所（雇い入れ直後）"
          required
          @input="$emit('update:initialWorkLocation', $event)"
        />
      </v-col>
      <v-col cols="12">
        <g-text-field
          :value="locationChangeScope"
          label="就業場所（変更の範囲）"
          required
          @input="$emit('update:locationChangeScope', $event)"
        />
      </v-col>
      <v-col cols="12">
        <g-text-field
          :value="initialJob"
          label="従事すべき業務の内容（雇い入れ直後）"
          required
          @input="$emit('update:initialJob', $event)"
        />
      </v-col>
      <v-col cols="12">
        <g-text-field
          :value="jobChangeScope"
          label="従事すべき業務の内容（変更の範囲）"
          required
          @input="$emit('update:jobChangeScope', $event)"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <g-text-field
          :value="startTime"
          class="center-input"
          label="始業時刻"
          required
          input-type="time"
          @input="$emit('update:startTime', $event)"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <g-text-field
          :value="endTime"
          class="center-input"
          label="終業時刻"
          required
          input-type="time"
          @input="$emit('update:endTime', $event)"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <g-numeric
          :value="breakMinutes"
          class="center-input"
          label="休憩時間"
          required
          suffix="分"
          @input="$emit('update:breakMinutes', $event)"
        />
      </v-col>
      <v-col cols="12">
        <g-checkbox
          :input-value="hasOvertime"
          class="mt-0"
          label="所定時間外労働の有無"
          @change="$emit('update:hasOvertime', $event)"
        />
      </v-col>
      <v-col cols="12">
        <v-card outlined class="flex-grow-1 mb-6">
          <v-card-text>
            <h4>所定労働日</h4>
            <v-input
              ref="scheduledWorkDays"
              :value="computedScheduledWorkDays"
              :rules="[rules.length, rules.overTime, rules.allDays]"
              hint="必ず就業する曜日を選択します"
              persistent-hint
            >
              <v-chip-group
                v-model="computedScheduledWorkDays"
                active-class="primary--text"
                column
                multiple
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
              :input-value="isHolidayWorkDay"
              label="祝日を所定労働日とする"
              @change="$emit('update:isHolidayWorkDay', $event)"
            />
            <h4>法定休日</h4>
            <v-chip-group
              :value="legalHoliday"
              active-class="primary--text"
              column
              mandatory
              @change="$emit('update:legalHoliday', $event)"
            >
              <v-chip
                v-for="day of days"
                :key="day.value"
                :value="day.value"
                :disabled="scheduledWorkDays.includes(day.value)"
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
          :value="averageMonthlyScheduledWorkDays"
          class="center-input"
          label="月平均所定日数"
          required
          decimal-places="2"
          suffix="日／月"
          @input="$emit('update:averageMonthlyScheduledWorkDays', $event)"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <g-numeric
          :value="overtimePayRate"
          class="center-input"
          label="時間外割増"
          required
          suffix="％"
          @input="$emit('update:overtimePayRate', $event)"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <g-numeric
          :value="holidayPayRate"
          class="center-input"
          label="休日割増"
          required
          suffix="％"
          @input="$emit('update:holidayPayRate', $event)"
        />
      </v-col>
      <v-col cols="12">
        <g-checkbox
          :input-value="bonusEligibility"
          class="mt-0"
          label="賞与対象"
          @change="$emit('update:bonusEligibility', $event)"
        />
      </v-col>
      <v-col cols="12">
        <v-expand-transition>
          <div v-show="!isHolidayWorkDay">
            <h4>祝日登録</h4>
            <!-- year 以外の日付は選択不可 -->
            <g-calendar
              ref="calendar"
              v-model="calendarDate"
              style="height: 480px"
              class="mb-6"
              :disable-prev="!calendarMonth || calendarMonth === '01'"
              :disable-next="!calendarMonth || calendarMonth === '12'"
              :events="
                holidays.map((holiday) => ({
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
        <g-textarea
          :value="remarks"
          label="備考"
          @input="$emit('update:remarks', $event)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<style></style>
