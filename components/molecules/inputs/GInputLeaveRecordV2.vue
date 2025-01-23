<script>
/**
 * 休暇実績入力用コンポーネント
 * - 従業員の勤怠実績について、欠勤や有給休暇、振替休日などの休暇実績情報を入力します。
 * @author shisyamo4131
 * @refact 2025-01-21
 */
import GDialogDatePicker from '../dialogs/GDialogDatePicker.vue'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'
import GDate from '~/components/atoms/inputs/GDate.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import { vueProps } from '~/models/propsDefinition/LeaveRecord'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GAutocompleteEmployee,
    GDialogDatePicker,
    GDate,
    GSelect,
    GCheckbox,
    GNumeric,
    GTextField,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeReceiver],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    ...vueProps,

    /**
     * 振替出勤日として選択可能な日付かどうかを返す関数です。
     */
    allowedDatesForSubstitute: {
      type: Function,
      default: null,
      required: false,
    },

    /**
     * 従業員選択を非表示にします。
     */
    hideEmployee: { type: Boolean, default: false, required: false },

    /**
     * 日付選択を非表示にします。
     */
    hideDate: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 休暇種類が変更された時の処理です。
     * - 振替休日が選択された場合に、備考欄を更新します。
     */
    onLeaveTypeChanged(event) {
      if (event === 'substitute') {
        this.$emit('update:remarks', '現場稼働に合わせるため')
      }
    },
  },
}
</script>

<template>
  <div>
    <g-autocomplete-employee
      v-if="!hideEmployee"
      :value="employeeId"
      label="従業員"
      :disabled="editMode !== CREATE"
      required
      @input="$emit('update:employeeId', $event)"
    />
    <g-dialog-date-picker :value="date" @input="$emit('update:date', $event)">
      <template #activator="{ attrs, on }">
        <g-date
          v-if="!hideDate"
          v-bind="attrs"
          label="日付"
          :disabled="editMode !== CREATE"
          required
          v-on="on"
        />
      </template>
    </g-dialog-date-picker>
    <g-select
      :value="leaveType"
      label="休暇種別"
      :items="$LEAVE_TYPE_ARRAY"
      required
      @input="$emit('update:leaveType', $event)"
      @change="onLeaveTypeChanged"
    />
    <v-expand-transition>
      <div v-show="leaveType === 'substitute'">
        <g-dialog-date-picker
          :value="substituteWorkDate"
          :allowed-dates="allowedDatesForSubstitute"
          @input="$emit('update:substituteWorkDate', $event)"
        >
          <template #activator="{ attrs, on }">
            <g-date
              v-bind="attrs"
              label="振替出勤日"
              :required="leaveType === 'substitute'"
              v-on="on"
            />
          </template>
        </g-dialog-date-picker>
      </div>
    </v-expand-transition>
    <v-expand-transition>
      <div v-show="leaveType === 'leave'">
        <g-checkbox
          :input-value="isAnnualPaidLeave"
          class="mt-0"
          label="年次有給休暇とする"
          :disabled="isPaidLeave"
          @change="$emit('update:isAnnualPaidLeave', $event)"
        />
        <g-checkbox
          :input-value="isPaidLeave"
          class="mt-0"
          label="休業補償を行う"
          :disabled="isAnnualPaidLeave"
          @change="$emit('update:isPaidLeave', $event)"
        />
        <v-expand-transition>
          <g-numeric
            v-show="isPaidLeave"
            :value="leavePaymentRate"
            class="right-input"
            label="補償率"
            suffix="%"
            :required="isPaidLeave"
            @input="$emit('update:leavePaymentRate', $event)"
          />
        </v-expand-transition>
      </div>
    </v-expand-transition>
    <g-text-field
      :value="remarks"
      label="事由"
      required
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
