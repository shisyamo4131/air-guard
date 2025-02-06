<script>
/**
 * 従業員雇用保険情報入力コンポーネント
 * @author shisayamo4131
 * @refact 2025-01-20
 */
import GAutocompleteEmployee from './GAutocompleteEmployee.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import { vueProps } from '~/models/propsDefinition/Pension'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GComboboxDate,
    GAutocompleteEmployee,
    GCheckbox,
    GSelect,
    GTextarea,
  },

  /***************************************************************************
   * MIXINS
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
          :disabled="!isCreate"
          @input="$emit('update:employeeId', $event)"
        />
        <g-combobox-date
          :value="acquisitionDate"
          label="資格取得日"
          required
          :disabled="isLossed"
          @input="$emit('update:acquisitionDate', $event)"
        />
        <g-select
          :value="acquisitionStatus"
          label="取得手続き状況"
          :items="$EMPLOYMENT_INSURANCE_PROCESSING_STATUS_ARRAY"
          required
          :disabled="isLossed"
          @input="$emit('update:acquisitionStatus', $event)"
        />
        <v-expand-transition>
          <div v-show="acquisitionStatus === 'COMPLETED'">
            <g-text-field
              :value="policyNumber"
              label="被保険者整理番号"
              :required="acquisitionStatus === 'COMPLETED'"
              :disabled="isLossed"
              @input="$emit('update:policyNumber', $event)"
            />
          </div>
        </v-expand-transition>
        <g-checkbox
          v-if="!isCreate"
          :input-value="isLossed"
          class="mt-0"
          label="資格喪失"
          :disabled="acquisitionStatus !== 'COMPLETED'"
          @change="$emit('update:isLossed', $event)"
        />
        <v-expand-transition>
          <div v-show="isLossed">
            <g-combobox-date
              :value="lossDate"
              label="資格喪失日"
              :required="isLossed"
              @input="$emit('update:lossDate', $event)"
            />
            <g-select
              :value="lossStatus"
              label="喪失手続き状況"
              :items="$EMPLOYMENT_INSURANCE_PROCESSING_STATUS_ARRAY"
              :required="isLossed"
              @input="$emit('update:lossStatus', $event)"
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
