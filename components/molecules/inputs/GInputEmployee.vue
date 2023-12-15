<template>
  <div>
    <g-text-field-employee-code
      ref="code"
      :value="code"
      label="CODE"
      @click:append-outer="contentCopy"
      @input="$emit('update:code', $event)"
    />
    <a-text-field
      :value="lastName"
      label="氏"
      required
      @input="$emit('update:lastName', $event)"
    />
    <a-text-field
      :value="firstName"
      label="名"
      @input="$emit('update:firstName', $event)"
    />
    <a-text-field
      :value="lastNameKana"
      label="氏カナ"
      required
      input-type="katakana"
      @input="$emit('update:lastNameKana', $event)"
    />
    <a-text-field
      :value="firstNameKana"
      label="名カナ"
      required
      input-type="katakana"
      @input="$emit('update:firstNameKana', $event)"
    />
    <a-text-field
      :value="abbr"
      label="略称"
      required
      counter
      maxlength="5"
      @input="$emit('update:abbr', $event)"
    />
  </div>
</template>

<script>
import GTextFieldEmployeeCode from './GTextFieldEmployeeCode.vue'
import ATextField from '~/components/atoms/inputs/ATextField.vue'
export default {
  components: { ATextField, GTextFieldEmployeeCode },
  props: {
    code: { type: undefined, default: null, required: false },
    lastName: { type: undefined, default: null, required: false },
    firstName: { type: undefined, default: null, required: false },
    lastNameKana: { type: undefined, default: null, required: false },
    firstNameKana: { type: undefined, default: null, required: false },
    abbr: { type: undefined, default: null, required: false },
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
