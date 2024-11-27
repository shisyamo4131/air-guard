<script>
/**
 * LeaveRecordsドキュメント入力コンポーネント
 *
 * @version 1.0.0
 * @author shisyamo4131
 * @updates
 * - version 1.0.0 - 2024-10-16 - 初版作成
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GDialogDatePicker from '../dialogs/GDialogDatePicker.vue'
import LeaveRecord from '~/models/LeaveRecord'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'
import GDate from '~/components/atoms/inputs/GDate.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GCheckboxDeleteData from '~/components/atoms/inputs/GCheckboxDeleteData.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCardInputForm,
    GAutocompleteEmployee,
    GDialogDatePicker,
    GDate,
    GSelect,
    GCheckbox,
    GNumeric,
    GCheckboxDeleteData,
    GTextField,
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
        return instance instanceof LeaveRecord
      },
    },
    alloweDatesForSubstitute: {
      type: Function,
      default: null,
      required: false,
    },
    hideEmployee: { type: Boolean, default: false, required: false },
    hideDate: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new LeaveRecord(),
    }
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onLeaveTypeChanged() {
      if (this.editModel.leaveType === 'substitute') {
        this.editModel.remarks = '現場の稼働に合わせるため'
      }
    },
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="休暇情報編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form :disabled="loading" @submit.prevent>
      <g-autocomplete-employee
        v-if="!hideEmployee"
        v-model="editModel.employeeId"
        label="従業員"
        :disabled="editMode !== CREATE"
        required
      />
      <g-dialog-date-picker v-model="editModel.date">
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
        v-model="editModel.leaveType"
        label="休暇種別"
        :items="[
          { text: '欠勤', value: 'absent' },
          { text: '振替休日', value: 'substitute' },
          { text: '代休', value: 'compOff' },
          { text: '休暇', value: 'leave' },
        ]"
        :disabled="editMode !== CREATE"
        required
        @change="onLeaveTypeChanged"
      />
      <v-expand-transition>
        <div v-show="editModel.leaveType === 'substitute'">
          <g-dialog-date-picker
            v-model="editModel.substituteWorkDate"
            :allowed-dates="alloweDatesForSubstitute"
          >
            <template #activator="{ attrs, on }">
              <g-date
                v-bind="attrs"
                label="振替出勤日"
                :disabled="
                  editModel.leaveType !== 'substitute' || editMode !== CREATE
                "
                v-on="on"
              />
            </template>
          </g-dialog-date-picker>
        </div>
      </v-expand-transition>
      <v-expand-transition>
        <div v-show="editModel.leaveType === 'leave'">
          <g-checkbox
            v-model="editModel.isAnnualPaidLeave"
            class="mt-0"
            label="年次有給休暇とする"
            :disabled="editModel.isPaidLeave"
          />
          <g-checkbox
            v-model="editModel.isPaidLeave"
            class="mt-0"
            label="休業補償を行う"
            :disabled="editModel.isAnnualPaidLeave"
          />
          <v-expand-transition>
            <g-numeric
              v-show="editModel.isPaidLeave"
              v-model="editModel.leavePaymentRate"
              class="right-input"
              label="補償率"
              suffix="%"
              :required="editModel.isPaidLeave"
            />
          </v-expand-transition>
        </div>
      </v-expand-transition>
      <g-text-field v-model="editModel.remarks" label="事由" required />
    </v-form>
    <g-checkbox-delete-data v-if="editMode !== CREATE" v-model="forceDelete" />
  </g-card-input-form>
</template>

<style></style>
