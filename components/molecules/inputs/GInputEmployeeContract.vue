<script>
/**
 * ### GInputEmployeeContract
 *
 * 従業員の雇用契約情報編集用コンポーネントです。
 *
 * @author shisayamo4131
 * @version 1.0.1
 *
 * @updates
 * - version 1.0.1 - 2024-07-24 - 追加モード以外では契約日を編集不可に。
 * - version 1.0.0 - 2024-07-18 - 初版作成
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GDialogDatePicker from '../dialogs/GDialogDatePicker.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GAutocompleteEmployee from '~/components/atoms/inputs/GAutocompleteEmployee.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import EmployeeContract from '~/models/EmployeeContract'
import GDate from '~/components/atoms/inputs/GDate.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GSelect,
    GTextarea,
    GNumeric,
    GCheckbox,
    GAutocompleteEmployee,
    GCardInputForm,
    GDialogDatePicker,
    GDate,
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
        return instance instanceof EmployeeContract
      },
    },
    hideEmployee: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new EmployeeContract(),
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="雇用契約情報編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form @submit.prevent>
      <g-autocomplete-employee
        v-if="!hideEmployee"
        v-model="editModel.employeeId"
        label="従業員"
        required
        :disabled="editMode !== CREATE"
      />
      <v-row dense>
        <v-col cols="12" md="3">
          <g-dialog-date-picker v-model="editModel.startDate">
            <template #activator="{ attrs, on }">
              <g-date
                class="center-input"
                v-bind="attrs"
                label="契約日"
                required
                :disabled="editMode !== CREATE"
                v-on="on"
              />
            </template>
          </g-dialog-date-picker>
        </v-col>
        <v-col cols="12" md="9">
          <g-checkbox
            v-model="editModel.hasPeriod"
            class="mt-1"
            label="期間の定め"
          />
        </v-col>
        <v-col cols="12" md="3">
          <g-dialog-date-picker v-model="editModel.expiredDate">
            <template #activator="{ attrs, on }">
              <g-date
                class="center-input"
                v-bind="attrs"
                label="契約満了日"
                :required="editModel.hasPeriod"
                v-on="on"
              />
            </template>
          </g-dialog-date-picker>
        </v-col>
        <v-col cols="12" md="9">
          <g-select
            v-model="editModel.contractType"
            label="雇用形態"
            :items="[
              { text: 'アルバイト', value: 'part-time' },
              { text: '契約社員', value: 'contract' },
              { text: '正社員', value: 'full-time' },
            ]"
            required
            attach
          />
        </v-col>
        <v-col cols="12" md="3">
          <g-select
            v-model="editModel.paymentType"
            label="支給形態"
            :items="[
              { text: '月給', value: 'monthly' },
              { text: '日給', value: 'daily' },
            ]"
            required
            attach
          />
        </v-col>
        <v-col cols="12" md="9">
          <g-numeric
            v-model="editModel.basicWage"
            class="center-input"
            label="基本給"
            required
            suffix="円"
          />
        </v-col>
      </v-row>
      <g-textarea v-model="editModel.remarks" label="備考" hide-details />
    </v-form>
  </g-card-input-form>
</template>

<style></style>
