<script>
/**
 * 稼働実績詳細（従業員）入力コンポーネント
 * @author shisyamo4131
 * @refact 2025-01-24
 */
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import { vueProps } from '~/models/propsDefinition/OperationResultWorker'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GTextarea,
    GAutocompleteEmployee,
    GCheckbox,
    GNumeric,
    GComboboxDate,
    GSelect,
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
    return {}
  },
}
</script>

<template>
  <div>
    <g-autocomplete-employee
      :value="employeeId"
      label="従業員"
      required
      @input="$emit('update:employeeId', $event)"
    />
    <v-row dense>
      <v-col cols="6">
        <g-combobox-date
          :value="date"
          label="勤務日"
          required
          @input="$emit('update:date', $event)"
        />
      </v-col>
      <v-col cols="6">
        <g-select
          :value="workResult"
          label="勤務結果"
          required
          :items="$WORK_RESULT_ARRAY"
          @input="$emit('update:workResult', $event)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="6" sm="3">
        <g-text-field
          :value="startTime"
          class="center-input"
          label="開始時刻"
          input-type="time"
          required
          @input="$emit('update:startTime', $event)"
        />
      </v-col>
      <v-col cols="6" sm="3">
        <g-text-field
          :value="endTime"
          class="center-input"
          label="終了時刻"
          input-type="time"
          required
          @input="$emit('update:endTime', $event)"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <g-checkbox
          :input-value="endAtNextday"
          class="mt-1"
          label="翌日終了"
          @change="$emit('update:endAtNextday', $event)"
        />
      </v-col>
      <v-col cols="6" sm="3">
        <g-numeric
          :value="breakMinutes"
          class="center-input"
          label="休憩時間"
          required
          @input="$emit('update:breakMinutes', $event)"
        />
      </v-col>
      <v-col cols="6" sm="3">
        <g-numeric
          :value="workMinutes"
          class="center-input"
          label="実働時間"
          readonly
        />
      </v-col>
      <v-col cols="6" sm="3">
        <g-numeric
          :value="overtimeMinutes"
          class="center-input"
          label="残業時間"
          readonly
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" sm="6">
        <g-checkbox
          :input-value="qualification"
          class="mt-1"
          label="資格者"
          @change="$emit('update:qualification', $event)"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <g-checkbox
          :input-value="ojt"
          class="mt-1"
          label="OJT"
          @change="$emit('update:ojt', $event)"
        />
      </v-col>
    </v-row>
    <g-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
