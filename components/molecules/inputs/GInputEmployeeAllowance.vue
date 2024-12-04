<script>
/**
 * 従業員支給手当情報入力コンポーネント
 * @author shisyamo4131
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import EmployeeAllowance from '~/models/EmployeeAllowance'
import GAutocomplete from '~/components/atoms/inputs/GAutocomplete.vue'
import GInputEditModeMixin from '~/mixins/GInputEditModeMixin'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GNumeric, GCardInputForm, GAutocomplete, GCheckbox },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GInputEditModeMixin],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {},

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new EmployeeAllowance(),
      deleteFlg: false,
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="支給手当情報"
    :edit-mode="editMode"
    v-on="$listeners"
  >
    <v-form @submit.prevent>
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
    </v-form>
    <g-checkbox
      v-if="editMode !== CREATE"
      label="このデータを削除する"
      :true-value="DELETE"
      :false-value="UPDATE"
      @change="$emit('update:editMode', $event)"
    />
  </g-card-input-form>
</template>

<style></style>
