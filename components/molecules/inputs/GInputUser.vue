<script>
/**
 * ## Users コレクションドキュメント入力コンポーネント
 *
 * - Users コレクションドキュメントは Authentication のアカウント作成時に、Cloud Functionsによって同期作成されます。
 * - よって、当該コンポーネントは編集専用となります。
 * - uidは読み取り専用です。
 *
 * @author shisyamo4131
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GCardInputForm from '../cards/GCardInputForm.vue'
import User from '~/models/User'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GAutocompleteEmployee from '~/components/atoms/inputs/GAutocompleteEmployee.vue'
import GCheckboxDeleteData from '~/components/atoms/inputs/GCheckboxDeleteData.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GCardInputForm,
    GAutocompleteEmployee,
    GCheckboxDeleteData,
    GCheckbox,
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
        return instance instanceof User
      },
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new User(),
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="ユーザー情報編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form @submit.prevent>
      <g-text-field
        v-model="editModel.docId"
        label="uid"
        readonly
        hint="読み取り専用"
        persistent-hint
      />
      <g-text-field v-model="editModel.displayName" label="表示名" required />
      <g-text-field v-model="editModel.email" label="email" required />
      <g-autocomplete-employee v-model="editModel.employeeId" label="従業員" />
      <g-checkbox
        v-model="editModel.isAdmin"
        class="mt-0"
        label="アドミニストレータ"
        hide-details
      />
      <g-checkbox v-model="editModel.isDeveloper" label="開発者" hide-details />
      <g-checkbox v-model="editModel.isManager" label="管理者" hide-details />
    </v-form>
    <g-checkbox-delete-data v-if="editMode !== CREATE" v-model="forceDelete" />
  </g-card-input-form>
</template>

<style></style>
