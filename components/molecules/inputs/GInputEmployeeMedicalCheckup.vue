<script>
/**
 * ### GInputEmployeeMedicalCheckup
 *
 * 概要:
 * 従業員の健康診断結果を編集するためのInputコンポーネントです。
 *
 * @author shisayamo4131
 * @create 2024-07-02
 * @version 1.0.0
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GAutocompleteEmployee from '~/components/atoms/inputs/GAutocompleteEmployee.vue'
import EmployeeMedicalCheckup from '~/models/EmployeeMedicalCheckup'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GSelect,
    GTextarea,
    GComboboxDate,
    GNumeric,
    GTextField,
    GAutocompleteEmployee,
    GCardInputForm,
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
        return instance instanceof EmployeeMedicalCheckup
      },
    },
    hideEmployee: { type: Boolean, default: false, required: false },
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="健康診断情報編集"
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
        <v-col cols="12" md="6">
          <g-combobox-date v-model="editModel.date" label="受診日" required />
        </v-col>
        <v-col cols="12" md="6">
          <g-select
            v-model="editModel.type"
            label="受診区分"
            :items="[
              { text: '入社時', value: 'entry' },
              { text: '法定検診', value: 'regular' },
            ]"
            required
            attach
          />
        </v-col>
        <v-col cols="12">
          <g-text-field v-model="editModel.agency" label="受診機関" required />
        </v-col>
        <v-col cols="12" md="6">
          <g-numeric v-model="editModel.bloodTop" label="血圧（上）" required />
        </v-col>
        <v-col cols="12" md="6">
          <g-numeric
            v-model="editModel.bloodBottom"
            label="血圧（下）"
            required
          />
        </v-col>
      </v-row>
      <g-textarea v-model="editModel.remarks" label="備考" hide-details />
    </v-form>
  </g-card-input-form>
</template>

<style></style>
