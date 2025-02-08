<script>
/**
 * 外注先入力コンポーネント
 * @author shisyamo4131
 * @refact 2025-02-08
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GTextFieldZipcode from '~/components/atoms/inputs/GTextFieldZipcode.vue'
import { vueProps } from '~/models/Outsourcer'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GTextarea,
    GTextFieldZipcode,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: vueProps,
}
</script>

<template>
  <div>
    <g-text-field
      :value="name"
      label="外注先名"
      required
      @input="$emit('update:name', $event)"
    />
    <g-text-field
      :value="abbr"
      label="略称"
      required
      hint="検索に使用されます"
      ignore-surrogate-pair
      @input="$emit('update:abbr', $event)"
    />
    <g-text-field
      :value="abbrKana"
      label="略称カナ"
      required
      hint="検索に使用されます"
      ignore-surrogate-pair
      input-type="katakana"
      @input="$emit('update:abbrKana', $event)"
    />
    <g-text-field-zipcode
      :value="zipcode"
      @input="$emit('update:zipcode', $event)"
      @loaded="$emit('update:address1', $event.full)"
    />
    <g-text-field
      :value="address1"
      label="住所"
      required
      @input="$emit('update:address1', $event)"
    />
    <g-text-field
      :value="address2"
      label="建物名・階数"
      @input="$emit('update:address2', $event)"
    />
    <g-text-field
      :value="tel"
      label="電話番号"
      input-type="tel"
      @input="$emit('update:tel', $event)"
    />
    <g-text-field
      :value="fax"
      label="FAX番号"
      input-type="tel"
      @input="$emit('update:fax', $event)"
    />
    <g-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
