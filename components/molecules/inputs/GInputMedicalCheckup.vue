<script>
/**
 * 従業員健康診断情報入力コンポーネント
 * @author shisayamo4131
 * @refact 2025-01-20
 */
import GAutocompleteEmployee from './GAutocompleteEmployee.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import { vueProps } from '~/models/propsDefinition/MedicalCheckup'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GComboboxDate,
    GAutocompleteEmployee,
    GSelect,
    GTextarea,
    GNumeric,
    GCheckbox,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [GMixinEditModeReceiver],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: vueProps,
}
</script>

<template>
  <div>
    <v-row>
      <v-col cols="12" md="6">
        <g-autocomplete-employee
          :value="employeeId"
          label="従業員"
          required
          :disabled="editMode !== CREATE"
          @input="$emit('update:employeeId', $event)"
        />
        <g-combobox-date
          :value="date"
          label="受診日"
          required
          @input="$emit('update:date', $event)"
        />
        <g-text-field
          :value="agency"
          label="受診機関"
          required
          @input="$emit('update:agency', $event)"
        />
        <g-select
          :value="type"
          label="受診区分"
          :items="$MEDICAL_CHECKUP_TYPE_ARRAY"
          required
          @input="$emit('update:type', $event)"
        />
        <v-row>
          <v-col cols="6">
            <g-numeric
              :value="bloodTop"
              label="血圧（上）"
              required
              @input="$emit('update:bloodTop', $event)"
            />
          </v-col>
          <v-col cols="6">
            <g-numeric
              :value="bloodBottom"
              label="血圧（下）"
              required
              @input="$emit('update:bloodBottom', $event)"
            />
          </v-col>
        </v-row>
        <g-checkbox
          :input-value="hasFindings"
          label="所見"
          @change="$emit('update:hasFindings', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
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
