<script>
/**
 * 従業員健康診断情報入力コンポーネント
 * @author shisayamo4131
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GAutocompleteEmployee from './GAutocompleteEmployee.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import MedicalCheckup from '~/models/MedicalCheckup'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GCardInputForm,
    GComboboxDate,
    GAutocompleteEmployee,
    GSelect,
    GTextarea,
    GNumeric,
    GCheckbox,
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
        return instance instanceof MedicalCheckup
      },
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new MedicalCheckup(),
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="健康診断情報編集"
    :edit-mode.sync="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-row>
      <v-col cols="12" md="6">
        <g-autocomplete-employee
          v-model="editModel.employeeId"
          label="従業員"
          required
          :disabled="editMode !== CREATE"
        />
        <g-combobox-date v-model="editModel.date" label="受診日" required />
        <g-text-field v-model="editModel.agency" label="受診機関" required />
        <g-select
          v-model="editModel.type"
          label="受診区分"
          :items="$MEDICAL_CHECKUP_TYPES_ARRAY"
          required
        />
        <v-row>
          <v-col cols="6">
            <g-numeric
              v-model="editModel.bloodTop"
              label="血圧（上）"
              required
            />
          </v-col>
          <v-col cols="6">
            <g-numeric
              v-model="editModel.bloodBottom"
              label="血圧（下）"
              required
            />
          </v-col>
        </v-row>
        <g-checkbox v-model="editModel.hasFindings" label="所見" />
      </v-col>
      <v-col cols="12" md="6">
        <g-textarea v-model="editModel.remarks" label="備考" />
      </v-col>
    </v-row>
  </g-card-input-form>
</template>

<style></style>
