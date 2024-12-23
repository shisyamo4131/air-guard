<script>
/**
 * 従業員厚生年金情報入力コンポーネント
 * @author shisayamo4131
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GAutocompleteEmployee from './GAutocompleteEmployee.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import Pension from '~/models/Pension'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GCardInputForm,
    GComboboxDate,
    GAutocompleteEmployee,
    GCheckbox,
    GSelect,
    GTextarea,
    GNumeric,
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
        return instance instanceof Pension
      },
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new Pension(),
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="厚生年金情報編集"
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
        <g-combobox-date
          v-model="editModel.acquisitionDate"
          label="資格取得日"
          required
          :disabled="editModel.isLossed"
        />
        <g-select
          v-model="editModel.acquisitionStatus"
          label="取得手続き状況"
          :items="$SOCIAL_SECURITY_PROCESSING_STATUS_ARRAY"
          required
          :disabled="editModel.isLossed"
        />
        <v-expand-transition>
          <div v-show="editModel.acquisitionStatus === 'COMPLETED'">
            <g-numeric
              v-model="editModel.standardMonthlyAmount"
              class="right-input"
              label="標準報酬月額"
              :required="editModel.acquisitionStatus === 'COMPLETED'"
              :disabled="editModel.isLossed"
              suffix="円"
            />
            <g-text-field
              v-model="editModel.policyNumber"
              label="被保険者整理番号"
              :required="editModel.acquisitionStatus === 'COMPLETED'"
              :disabled="editModel.isLossed"
            />
          </div>
        </v-expand-transition>
        <g-checkbox
          v-if="editMode !== CREATE"
          v-model="editModel.isLossed"
          class="mt-0"
          label="資格喪失"
          :disabled="editModel.acquisitionStatus !== 'COMPLETED'"
        />
        <v-expand-transition>
          <div v-show="editModel.isLossed">
            <g-combobox-date
              v-model="editModel.lossDate"
              label="資格喪失日"
              :required="editModel.isLossed"
            />
            <g-select
              v-model="editModel.lossStatus"
              label="喪失手続き状況"
              :items="$SOCIAL_SECURITY_PROCESSING_STATUS_ARRAY"
              :required="editModel.isLossed"
            />
          </div>
        </v-expand-transition>
      </v-col>
      <v-col cols="12" md="6">
        <g-textarea v-model="editModel.remarks" label="備考" />
      </v-col>
    </v-row>
  </g-card-input-form>
</template>

<style></style>
