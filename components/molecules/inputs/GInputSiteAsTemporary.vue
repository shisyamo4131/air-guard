<script>
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import { props } from '~/models/Site'
import EditMode from '~/components/mixins/GMixinEditMode'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GAutocompleteCustomer from '~/components/atoms/inputs/GAutocompleteCustomer.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'

/**
 * ### GInputSite
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GSelect, GTextField, GAutocompleteCustomer, GComboboxDate },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props, EditMode],
  props: {
    hideCustomer: { type: Boolean, default: false, required: false },
  },
}
</script>

<template>
  <div>
    <g-autocomplete-customer
      v-if="!hideCustomer"
      :value="customerId"
      label="取引先"
      required
      @input="$emit('update:customerId', $event)"
    />
    <g-text-field
      :value="name"
      label="現場名"
      required
      @input="$emit('update:name', $event)"
      @change="$emit('update:abbr', $event)"
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
      :value="address"
      label="住所"
      required
      @input="$emit('update:address', $event)"
    />
    <g-combobox-date
      :value="dates"
      label="稼働予定日"
      multiple
      @input="$emit('update:dates', $event)"
    />
    <g-select
      :value="securityType"
      label="警備種別"
      :items="$SECURITY_TYPE_ARRAY"
      required
      @input="$emit('update:securityType', $event)"
    />
  </div>
</template>

<style></style>
