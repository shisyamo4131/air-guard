<template>
  <div>
    <g-text-field-customer-code
      ref="code"
      :value="code"
      label="CODE"
      @click:append-outer="contentCopy"
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

<script>
import GTextFieldCustomerCode from './GTextFieldCustomerCode.vue'
import ATextField from '~/components/atoms/inputs/ATextField.vue'
export default {
  components: { ATextField, GTextFieldCustomerCode },
  props: {
    code: { type: undefined, default: null, required: false },
    name1: { type: undefined, default: null, required: false },
    name2: { type: undefined, default: null, required: false },
    abbr: { type: undefined, default: null, required: false },
    abbrKana: { type: undefined, default: null, required: false },
    address: { type: undefined, default: null, required: false },
    status: { type: undefined, default: null, required: false },
  },
  methods: {
    contentCopy() {
      const fetchedItem = this.$refs.code.fetchedItem
      Object.keys(fetchedItem).forEach((key) => {
        if (key in this.$props) {
          this.$emit(`update:${key}`, fetchedItem[key])
        }
      })
    },
  },
}
</script>

<style></style>
