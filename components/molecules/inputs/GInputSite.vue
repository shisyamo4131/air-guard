<script>
import GAutocompleteCustomer from './GAutocompleteCustomer.vue'
import GTextField from './GTextField.vue'
import GDate from './GDate.vue'
import { props } from '~/models/Site'
import EditMode from '~/components/molecules/mixins/EditMode'

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
  components: { GAutocompleteCustomer, GTextField, GDate },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props, EditMode],
}
</script>

<template>
  <div>
    <g-text-field
      :value="code"
      label="CODE"
      disabled
      @input="$emit('update:code', $event)"
    />
    <g-autocomplete-customer
      :value="customer"
      :disabled="editMode !== 'REGIST'"
      label="取引先"
      required
      return-object
      @input="$emit('update:customer', $event)"
    />
    <g-text-field
      :value="name"
      label="現場名"
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
    <g-text-field
      :value="abbrNumber"
      label="略称番号"
      @input="$emit('update:abbrNumber', $event)"
    />
    <g-text-field
      :value="address"
      label="住所"
      required
      @input="$emit('update:address', $event)"
    />
    <g-date
      :value="startAt"
      label="開始日"
      @input="$emit('update:startAt', $event)"
    />
    <g-date
      :value="endAt"
      label="終了日"
      @input="$emit('update:endAt', $event)"
    />
  </div>
</template>

<style></style>
