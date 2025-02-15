<script>
/**
 * 就業規則情報の入力コンポーネントです。
 * @author shisayamo4131
 * @refact 2025-02-13
 */
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import WorkRegulation, { vueProps } from '~/models/WorkRegulation'
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
    GSelect,
    GDatePicker,
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
      days: [
        { text: '月曜日', value: 'mon' },
        { text: '火曜日', value: 'tue' },
        { text: '水曜日', value: 'wed' },
        { text: '木曜日', value: 'thu' },
        { text: '金曜日', value: 'fri' },
        { text: '土曜日', value: 'sat' },
        { text: '日曜日', value: 'sun' },
      ],

      instance: new WorkRegulation(),

      pickerDate: undefined,
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * props.year を監視します。
     * - 値が設定されたら、DatePicker の 表示年月をその年の1月にします。
     */
    year: {
      handler(v) {
        if (!v) return
        this.pickerDate = `${v}-01`
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {},
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
          :items="$EMPLOYEE_CONTRACT_TYPE_ARRAY"
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
        <g-checkbox
          :input-value="hasHolidayWork"
          class="mt-0"
          label="休日労働の有無"
          @change="$emit('update:hasHolidayWork', $event)"
        />
      </v-col>
      <v-col cols="12">
        <h4>法定休日</h4>
        <v-input>
          <v-chip-group
            :value="legalHoliday"
            active-class="accent--text"
            column
            mandatory
            @change="$emit('update:legalHoliday', $event)"
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
      </v-col>
      <v-col cols="12">
        <h4>法定外休日</h4>
        <v-input>
          <v-chip-group
            :value="nonStatutoryHolidays"
            active-class="accent--text"
            column
            multiple
            @change="$emit('update:nonStatutoryHolidays', $event)"
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
      </v-col>
      <v-col cols="12">
        <h4>その他公休日</h4>
        <v-input :value="nonStatutoryHolidays">
          <g-date-picker
            :value="otherHolidays"
            :allowed-dates="
              (date) => {
                if ($dayjs(date).format('YYYY') !== year) return false
                if (!legalHoliday) return true
                const dayOfWeek = $dayjs(date).format('ddd').toLowerCase()
                return (
                  dayOfWeek !== legalHoliday &&
                  !nonStatutoryHolidays.includes(dayOfWeek)
                )
              }
            "
            :disabled="!year"
            multiple
            no-title
            :picker-date.sync="pickerDate"
            @input="$emit('update:otherHolidays', $event)"
          />
        </v-input>
      </v-col>
      <v-col cols="12" sm="4">
        <g-numeric
          :value="averageMonthlyScheduledWorkDays"
          class="center-input"
          label="月平均所定日数"
          decimal-places="3"
          readonly
          suffix="日／月"
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
