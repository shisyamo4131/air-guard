<script>
/**
 * NewUsersドキュメント入力コンポーネント
 * @author shisyamo4131
 * @refact 2025-01-20
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'
import { vueProps } from '~/models/propsDefinition/NewUser'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, GAutocompleteEmployee },

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
    <g-text-field
      :value="email"
      label="email"
      required
      input-type="email"
      @input="$emit('update:email', $event)"
    />
    <g-text-field
      :value="password"
      label="password"
      required
      type="password"
      @input="$emit('update:password', $event)"
    />
    <g-autocomplete-employee
      :value="employeeId"
      label="従業員"
      @input="$emit('update:employeeId', $event)"
    />
    <g-text-field
      :value="displayName"
      label="表示名"
      required
      @input="$emit('update:displayName', $event)"
    />
  </div>
</template>

<style></style>
