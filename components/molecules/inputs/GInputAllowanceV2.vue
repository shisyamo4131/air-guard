<script>
/**
 * 手当入力コンポーネント
 * @author shisyamo4131
 * @refact 2025-01-13
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GAutocompletePaymentType from '~/components/atoms/inputs/GAutocompletePaymentType.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import { vueProps } from '~/models/propsDefinition/Allowance'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GAutocompletePaymentType,
    GTextarea,
    GSwitch,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeReceiver],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    ...vueProps,
  },
}
</script>

<template>
  <div>
    <g-text-field
      :value="name"
      label="手当名"
      required
      @input="$emit('update:name', $event)"
    />
    <g-text-field
      :value="nameKana"
      label="手当名カナ"
      required
      hint="検索に使用されます"
      ignore-surrogate-pair
      input-type="katakana"
      @input="$emit('update:nameKana', $event)"
    />
    <g-autocomplete-payment-type
      :value="paymentType"
      required
      attach
      @input="$emit('update:paymentType', $event)"
    />
    <g-switch
      :input-value="isIncludedInOvertimeBase"
      class="mt-0"
      label="時間外基礎に含める"
      @change="$emit('update:isIncludedInOvertimeBase', $event)"
    />
    <g-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
