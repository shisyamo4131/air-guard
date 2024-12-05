<script>
/**
 * NewUsersドキュメント入力コンポーネント
 *
 * @author shisyamo4131
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GCardInputForm from '../cards/GCardInputForm.vue'
import NewUser from '~/models/NewUser'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, GCardInputForm, GAutocompleteEmployee },
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
        return instance instanceof NewUser
      },
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new NewUser(),
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="新規ユーザー情報入力"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <g-text-field
      v-model="editModel.email"
      label="email"
      required
      input-type="email"
    />
    <g-text-field
      v-model="editModel.password"
      label="password"
      required
      type="password"
    />
    <g-autocomplete-employee
      v-model="editModel.employeeId"
      label="従業員"
      required
    />
    <g-text-field v-model="editModel.displayName" label="表示名" required />
  </g-card-input-form>
</template>

<style></style>
