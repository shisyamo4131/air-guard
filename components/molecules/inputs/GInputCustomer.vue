<script>
import GTextField from '../../atoms/inputs/GTextField.vue'
import GSelect from '../../atoms/inputs/GSelect.vue'
import GNumeric from '../../atoms/inputs/GNumeric.vue'
import ARenderlessZipcode from '~/components/atoms/renderless/ARenderlessZipcode.vue'
import { props } from '~/models/Customer'
import EditMode from '~/components/mixins/GMixinEditMode'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'

/**
 * ## GInputCustomer
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ARenderlessZipcode, GTextField, GSelect, GNumeric, GTextarea },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props, EditMode],
}
</script>

<template>
  <div>
    <g-text-field
      :value="name1"
      label="取引先名1"
      required
      @input="$emit('update:name1', $event)"
    />
    <g-text-field
      :value="name2"
      label="取引先名2"
      @input="$emit('update:name2', $event)"
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
    <a-renderless-zipcode
      :value="zipcode"
      @input="$emit('update:zipcode', $event)"
      @loaded="$emit('update:address1', $event.full)"
    >
      <template #default="{ attrs, on }">
        <g-text-field v-bind="attrs" label="郵便番号" v-on="on" />
      </template>
    </a-renderless-zipcode>
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
    <g-select
      :value="deadline"
      label="締日"
      :items="$DEADLINE_ARRAY"
      @input="$emit('update:deadline', $event)"
    />
    <g-numeric
      :value="depositMonth"
      label="入金月"
      suffix="ヶ月後"
      @input="$emit('update:depositMonth', $event)"
    />
    <g-select
      :value="depositDate"
      label="入金日"
      :items="$DEADLINE_ARRAY"
      @input="$emit('update:depositDate', $event)"
    />
    <g-textarea
      :value="remarks"
      label="備考"
      hide-details
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
