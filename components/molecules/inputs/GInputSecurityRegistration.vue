<script>
/**
 * 従業員警備員登録情報入力コンポーネント
 * - Employee クラスの securityRegistration プロパティを編集するためのコンポーネントです。
 * @author shisyamo4131
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import Employee from '~/models/Employee'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GNumeric, GCardInputForm, GComboboxDate },
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
        return instance instanceof Employee
      },
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new Employee(),
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="警備員登録情報"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <g-combobox-date
      v-model="editModel.securityRegistration.registrationDate"
      label="警備員登録日"
      required
    />
    <g-combobox-date
      v-model="editModel.securityRegistration.securityStartDate"
      label="警備経験開始日"
      required
    />
    <g-numeric
      v-model="editModel.securityRegistration.blankMonths"
      label="ブランク"
      required
      suffix="ヶ月"
    />
  </g-card-input-form>
</template>

<style></style>
