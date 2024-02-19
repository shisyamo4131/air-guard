<script>
import GAutocompleteCustomer from './GAutocompleteCustomer.vue'
import ATextField from '~/components/atoms/inputs/ATextField.vue'
import { props } from '~/models/Site'
import ADate from '~/components/atoms/inputs/ADate.vue'

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
  components: { ATextField, GAutocompleteCustomer, ADate },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props],
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
      :value="customer"
      label="取引先"
      required
      return-object
      @input="$emit('update:customer', $event)"
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
      :value="abbrNumber"
      label="略称番号"
      @input="$emit('update:abbrNumber', $event)"
    />
    <a-text-field
      :value="address"
      label="住所"
      required
      @input="$emit('update:address', $event)"
    />
    <a-date
      :value="startAt"
      label="開始日"
      @input="$emit('update:startAt', $event)"
    />
    <a-date
      :value="endAt"
      label="終了日"
      @input="$emit('update:endAt', $event)"
    />
  </div>
</template>

<style></style>
