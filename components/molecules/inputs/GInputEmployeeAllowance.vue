<script>
/**
 * 従業員支給手当情報入力コンポーネント
 * @author shisyamo4131
 */
import GCardInputFormV2 from '../cards/GCardInputFormV2.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import EmployeeAllowance from '~/models/EmployeeAllowance'
import GAutocomplete from '~/components/atoms/inputs/GAutocomplete.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GNumeric, GCardInputFormV2, GAutocomplete },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new EmployeeAllowance(),
    }
  },
}
</script>

<template>
  <g-card-input-form-v-2 v-bind="$attrs" label="支給手当情報" v-on="$listeners">
    <g-autocomplete
      v-model="editModel.docId"
      label="手当"
      :items="$store.getters['allowances/items']"
      item-value="docId"
      item-text="name"
      required
    />
    <g-numeric
      v-model="editModel.amount"
      class="right-input"
      label="金額"
      required
      suffix="円"
    />
  </g-card-input-form-v-2>
</template>

<style></style>
