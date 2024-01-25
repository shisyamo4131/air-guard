<script>
import GAutocompleteCustomer from './GAutocompleteCustomer.vue'
import ATextField from '~/components/atoms/inputs/ATextField.vue'
/**
 * ## GInputSite
 * Site用INPUT
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ATextField, GAutocompleteCustomer },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    code: { type: undefined, default: null, required: false },
    name: { type: undefined, default: null, required: false },
    abbr: { type: undefined, default: null, required: false },
    abbrKana: { type: undefined, default: null, required: false },
    address: { type: undefined, default: null, required: false },
    customerId: { type: undefined, default: null, required: false },
    status: { type: undefined, default: null, required: false },
  },
}
</script>

<template>
  <div>
    <a-text-field
      :value="code"
      label="CODE"
      disabled
      @input="$emit('update:code', $event)"
    />
    <g-autocomplete-customer
      :value="customerId"
      label="取引先"
      required
      @input="$emit('update:customerId', $event)"
    />
    <a-text-field
      :value="name"
      label="現場名"
      required
      @input="$emit('update:name', $event)"
    />
    <a-text-field
      :value="abbr"
      label="略称"
      required
      @input="$emit('update:abbr', $event)"
    />
    <a-text-field
      :value="abbrKana"
      label="略称カナ"
      required
      input-type="katakana"
      @input="$emit('update:abbrKana', $event)"
    />
    <a-text-field
      :value="address"
      label="住所"
      required
      @input="$emit('update:address', $event)"
    />
  </div>
</template>

<style></style>
