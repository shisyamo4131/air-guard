<script>
/**
 * 手当入力コンポーネント
 * @author shisyamo4131
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GCardInputForm from '../cards/GCardInputForm.vue'
import Allowance from '~/models/Allowance'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GCheckboxDeleteData from '~/components/atoms/inputs/GCheckboxDeleteData.vue'
import GAutocompletePaymentType from '~/components/atoms/inputs/GAutocompletePaymentType.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GCardInputForm,
    GCheckboxDeleteData,
    GAutocompletePaymentType,
    GTextarea,
    GSwitch,
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
        return instance instanceof Allowance
      },
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new Allowance(),
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="手当情報編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form @submit.prevent>
      <g-text-field v-model="editModel.name" label="手当名" required />
      <g-text-field
        v-model="editModel.nameKana"
        label="手当名カナ"
        required
        hint="検索に使用されます"
        ignore-surrogate-pair
        input-type="katakana"
      />
      <g-autocomplete-payment-type
        v-model="editModel.paymentType"
        required
        attach
      />
      <g-switch
        v-model="editModel.isIncludedInOvertimeBase"
        class="mt-0"
        label="時間外基礎に含める"
      />
      <g-textarea v-model="editModel.remarks" label="備考" hide-details />
    </v-form>
    <g-checkbox-delete-data v-if="editMode !== CREATE" v-model="forceDelete" />
  </g-card-input-form>
</template>

<style></style>
