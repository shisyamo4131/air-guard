<script>
/**
 * Usersドキュメント入力コンポーネント
 *
 * - UsersドキュメントはAuthenticationのアカウント作成時に、Cloud Functionsによって同期作成されます。
 * - uidは読み取り専用とします。
 * - Employeesドキュメントとの紐づけは専用の機能で行います。
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GCardInputForm from '../cards/GCardInputForm.vue'
import User from '~/models/User'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, GCardInputForm },
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
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form ref="form" @submit.prevent>
      <g-text-field
        v-model="editModel.uid"
        label="uid"
        readonly
        hint="読み取り専用"
        persistent-hint
      />
      <g-text-field v-model="editModel.displayName" label="表示名" required />
    </v-form>
  </g-card-input-form>
</template>

<style></style>
