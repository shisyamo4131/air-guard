<script>
import GDate from '~/components/atoms/inputs/GDate.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import { props } from '~/models/Site'
import EditMode from '~/components/mixins/GMixinEditMode'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GAutocompleteCustomer from '~/components/atoms/inputs/GAutocompleteCustomer.vue'

/**
 * ### GInputSite
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDate, GSelect, GTextField, GAutocompleteCustomer },
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
