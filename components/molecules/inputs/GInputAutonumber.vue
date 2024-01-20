<template>
  <div>
    <a-text-field
      :value="docId"
      label="Collection"
      required
      @input="$emit('update:docId', $event)"
    />
    <a-numeric
      :value="current"
      label="current"
      required
      @input="$emit('update:current', $event)"
    />
    <a-numeric
      :value="length"
      label="length"
      required
      @input="$emit('update:length', $event)"
    />
    <a-text-field
      :value="field"
      label="field"
      required
      @input="$emit('update:field', $event)"
    />
    <a-switch
      :input-value="status"
      label="status"
      @change="$emit('update:status', $event)"
    />
  </div>
</template>

<script>
import ATextField from '~/components/atoms/inputs/ATextField.vue'
import ANumeric from '~/components/atoms/inputs/ANumeric.vue'
import ASwitch from '~/components/atoms/inputs/ASwitch.vue'
export default {
  components: { ATextField, ANumeric, ASwitch },
  props: {
    docId: { type: String, default: '', required: false },
    current: { type: Number, default: null, required: false },
    length: { type: Number, default: null, required: false },
    field: { type: String, default: '', required: false },
    status: { type: Boolean, default: false, required: false },
  },
}
</script>

<style></style>
