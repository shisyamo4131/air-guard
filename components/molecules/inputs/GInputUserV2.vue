<script>
/**
 * ユーザー情報入力コンポーネントです。
 * @author shisyamo4131
 * @refact 2025-01-20
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import { vueProps } from '~/models/propsDefinition/User'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GAutocompleteEmployee,
    GCheckbox,
  },

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
      :value="docId"
      label="uid"
      readonly
      hint="読み取り専用"
      persistent-hint
      @input="$emit('update:docId', $event)"
    />
    <g-text-field
      :value="displayName"
      label="表示名"
      required
      @input="$emit('update:displayName', $event)"
    />
    <g-text-field
      :value="email"
      label="email"
      required
      @input="$emit('update:email', $event)"
    />
    <g-autocomplete-employee
      :value="employeeId"
      label="従業員"
      @input="$emit('update:employeeId', $event)"
    />
    <g-checkbox
      :input-value="isAdmin"
      class="mt-0"
      label="アドミニストレータ"
      hide-details
      @change="$emit('update:isAdmin', $event)"
    />
    <g-checkbox
      :input-value="isDeveloper"
      label="開発者"
      hide-details
      @change="$emit('update:isDeveloper', $event)"
    />
    <g-checkbox
      :input-value="isManager"
      label="管理者"
      hide-details
      @change="$emit('update:isManager', $event)"
    />
  </div>
</template>

<style></style>
