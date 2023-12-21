<template>
  <div>
    <g-text-field-site-code
      ref="code"
      :value="code"
      label="CODE"
      :edit-mode="editMode"
      :disabled="synchronized"
      @click:append-outer="contentCopy"
      @input="$emit('update:code', $event)"
    />
    <a-autocomplete
      :value="customerId"
      label="取引先"
      required
      :items="$store.getters['masters/Customers']"
      item-text="abbr"
      item-value="docId"
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

<script>
import GTextFieldSiteCode from './GTextFieldSiteCode.vue'
import ATextField from '~/components/atoms/inputs/ATextField.vue'
import AAutocomplete from '~/components/atoms/inputs/AAutocomplete.vue'
import { editMode } from '~/components/mixins'
export default {
  components: { ATextField, GTextFieldSiteCode, AAutocomplete },
  mixins: [editMode],
  props: {
    code: { type: undefined, default: null, required: false },
    name: { type: undefined, default: null, required: false },
    abbr: { type: undefined, default: null, required: false },
    abbrKana: { type: undefined, default: null, required: false },
    address: { type: undefined, default: null, required: false },
    customerId: { type: undefined, default: null, required: false },
    status: { type: undefined, default: null, required: false },
    synchronized: { type: Boolean, default: false, required: false },
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
