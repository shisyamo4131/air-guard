<script>
/**
 * 従業員健康保険情報入力コンポーネント
 * @author shisayamo4131
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import EmployeeHealthInsurance from '~/models/EmployeeHealthInsurance'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, GCardInputForm, GComboboxDate, GNumeric },

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
        return instance instanceof EmployeeHealthInsurance
      },
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new EmployeeHealthInsurance(),
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="健康保険情報編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <g-combobox-date
      v-model="editModel.acquisitionDate"
      label="資格取得日"
      required
    />
    <g-numeric
      v-model="editModel.standardMonthlyAmount"
      label="標準報酬月額"
      class="right-input"
      suffix="円/月"
      required
    />
    <g-text-field
      v-model="editModel.policyNumber"
      label="被保険者整理番号"
      required
    />
  </g-card-input-form>
</template>

<style></style>
