<script>
/**
 * ### GInputWorkRegulation
 *
 * 就業規則の編集用コンポーネントです。
 *
 * @author shisayamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.1 - 2024-07-18 - 月平均所定労働日数を追加
 * - version 1.0.0 - 2024-07-17 - 初版作成
 */
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import { props } from '~/models/WorkRegulation'
import EditMode from '~/mixins/GMixinEditMode'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextarea, GNumeric, GTextField, GCheckbox },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props, EditMode],
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
      this.$emit('update:legalHoliday', '')
      const result = arr.sort(
        (a, b) =>
          this.days.findIndex((day) => day.value === a) -
          this.days.findIndex((day) => day.value === b)
      )
      this.$emit('update:scheduledWorkDays', result)
    },
  },
}
</script>

<template>
  <v-row dense>
    <v-col cols="12">
      <g-text-field
        :value="name"
        label="就業規則名"
        required
        hint="'正社員'、'契約社員'など"
        persistent-hint
        @input="$emit('update:name', $event)"
      />
    </v-col>
    <v-col cols="12" sm="4">
      <g-text-field
        class="center-input"
        :value="startTime"
        label="始業時刻"
        required
        input-type="time"
        @input="$emit('update:startTime', $event)"
      />
    </v-col>
    <v-col cols="12" sm="4">
      <g-text-field
        class="center-input"
        :value="endTime"
        label="終業時刻"
        required
        input-type="time"
        @input="$emit('update:endTime', $event)"
      />
    </v-col>
    <v-col cols="12" sm="4">
      <g-numeric
        class="center-input"
        :value="breakMinutes"
        label="休憩時間"
        required
        suffix="分"
        @input="$emit('update:breakMinutes', $event)"
      />
    </v-col>
    <v-col cols="12">
      <v-card outlined class="flex-grow-1 mb-4">
        <v-card-text>
          <h4>所定労働日</h4>
          <v-input
            ref="scheduledWorkDays"
            :value="scheduledWorkDays"
            :rules="[rules.length, rules.overTime, rules.allDays]"
            hint="必ず就業する曜日を選択します"
            persistent-hint
          >
            <v-chip-group
              :value="scheduledWorkDays"
              active-class="primary--text"
              column
              multiple
              @change="onInputScheduledWorkingDays"
            >
              <v-chip
                v-for="day of days"
                :key="day.value"
                outlined
                small
                :value="day.value"
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
              :disabled="scheduledWorkDays.includes(day.value)"
              outlined
              small
              :value="day.value"
            >
              {{ day.text }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="4">
      <g-numeric
        class="center-input"
        :value="averageMonthlyScheduledWorkDays"
        label="月平均所定日数"
        required
        decimal-places="2"
        suffix="日／月"
        @input="$emit('update:averageMonthlyScheduledWorkDays', $event)"
      />
    </v-col>
    <v-col cols="12" sm="4">
      <g-numeric
        class="center-input"
        :value="overtimePayRate"
        label="時間外割増"
        required
        suffix="％"
        @input="$emit('update:overtimePayRate', $event)"
      />
    </v-col>
    <v-col cols="12" sm="4">
      <g-numeric
        class="center-input"
        :value="holidayPayRate"
        label="休日割増"
        required
        suffix="％"
        @input="$emit('update:holidayPayRate', $event)"
      />
    </v-col>
    <v-col cols="12">
      <g-checkbox
        class="mt-0"
        :input-value="bonusEligibility"
        label="賞与対象"
        @change="$emit('update:bonusEligibility', $event)"
      />
    </v-col>
    <v-col cols="12">
      <g-textarea
        :value="remarks"
        label="備考"
        hide-details
        @input="$emit('update:remarks', $event)"
      />
    </v-col>
  </v-row>
</template>

<style></style>
