<script>
import ANumeric from '~/components/atoms/inputs/ANumeric.vue'
import ASelect from '~/components/atoms/inputs/ASelect.vue'
import ATextarea from '~/components/atoms/inputs/ATextarea.vue'
import ATextField from '~/components/atoms/inputs/ATextField.vue'
import ARenderlessZipcode from '~/components/atoms/renderless/ARenderlessZipcode.vue'
import { props } from '~/models/Customer'

/**
 * ## GInputCustomer
 * Customer用INPUT
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ATextField, ARenderlessZipcode, ASelect, ANumeric, ATextarea },
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
    <a-text-field
      :value="name1"
      label="取引先名1"
      required
      @input="$emit('update:name1', $event)"
    />
    <a-text-field
      :value="name2"
      label="取引先名2"
      @input="$emit('update:name2', $event)"
    />
    <a-text-field
      :value="abbr"
      label="略称"
      required
      hint="検索に使用されます"
      ignore-surrogate-pair
      @input="$emit('update:abbr', $event)"
    />
    <a-text-field
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
        <a-text-field v-bind="attrs" label="郵便番号" v-on="on" />
      </template>
    </a-renderless-zipcode>
    <a-text-field
      :value="address1"
      label="住所"
      required
      @input="$emit('update:address1', $event)"
    />
    <a-text-field
      :value="address2"
      label="建物名・階数"
      @input="$emit('update:address2', $event)"
    />
    <a-text-field
      :value="tel"
      label="電話番号"
      input-type="tel"
      @input="$emit('update:tel', $event)"
    />
    <a-text-field
      :value="fax"
      label="FAX番号"
      input-type="tel"
      @input="$emit('update:fax', $event)"
    />
    <a-select
      :value="deadline"
      label="締日"
      :items="$DEADLINE_ARRAY"
      @input="$emit('update:deadline', $event)"
    />
    <a-numeric
      :value="depositMonth"
      label="入金月"
      suffix="ヶ月後"
      @input="$emit('update:depositMonth', $event)"
    />
    <a-select
      :value="depositDate"
      label="入金日"
      :items="$DEADLINE_ARRAY"
      @input="$emit('update:depositDate', $event)"
    />
    <a-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
