<script>
/**
 * ## GInputWorkRegulation
 *
 * @author shisayamo4131
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import WorkRegulation from '~/models/WorkRegulation'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GDatePicker from '~/components/atoms/pickers/GDatePicker.vue'
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
    GDatePicker,
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
      pickerDate: null,
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
   * WATCH
   ***************************************************************************/
  watch: {
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
    onChangedYear() {
      this.pickerDate = this.editModel.year
        ? this.$dayjs(`${this.editModel.year}-01-01`).format('YYYY-MM-DD')
        : null
      this.refreshHolidays()
    },
    refreshHolidays() {
      if (!this.editModel.year) {
        this.editModel.holidays.splice(0)
      } else {
        this.editModel.holidays = this.editModel.holidays.filter((date) => {
          return date.slice(0, 4) === this.editModel.year
        })
      }
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
          :rules="[(v) => !v || v.length === 4 || '西暦で入力']"
          required
          suffix="年"
          @change="onChangedYear"
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
        <v-card outlined class="flex-grow-1 mb-4">
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
            <g-date-picker
              v-model="editModel.holidays"
              :allowed-dates="
                (val) => editModel.year && val.slice(0, 4) === editModel.year
              "
              multiple
              no-title
              :picker-date.sync="pickerDate"
            />
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
