<script>
/**
 * 従業員健康保険情報入力コンポーネント
 * @author shisayamo4131
 * @refact 2025-02-13
 */
import GAutocompleteEmployee from './GAutocompleteEmployee.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import { vueProps } from '~/models/HealthInsurance'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GComboboxDate,
    GAutocompleteEmployee,
    GTextarea,
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
    hideEmployee: { type: Boolean, default: false, required: false },
  },
}
</script>

<template>
  <div>
    <v-row>
      <v-col cols="12" md="6">
        <g-autocomplete-employee
          v-if="!hideEmployee"
          :value="employeeId"
          label="従業員"
          required
          :disabled="!isCreate"
          @input="$emit('update:employeeId', $event)"
        />
        <g-combobox-date
          :value="acquisitionDate"
          label="資格取得日"
          required
          @input="$emit('update:acquisitionDate', $event)"
        />
        <g-text-field
          :value="policyNumber"
          label="被保険者整理番号"
          required
          @input="$emit('update:policyNumber', $event)"
        />
        <v-expand-transition>
          <div v-show="!isCreate">
            <g-combobox-date
              :value="lossDate"
              label="資格喪失日"
              @input="$emit('update:lossDate', $event)"
            />
          </div>
        </v-expand-transition>
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
