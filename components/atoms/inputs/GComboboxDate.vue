<script>
/**
 * ### GComboboxDate
 * @shisyamo4131
 */
import GDatePicker from '../pickers/GDatePicker.vue'
import GCombobox from './GCombobox.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCombobox, GDatePicker },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    disabled: { type: Boolean, default: false, required: false },
    multiple: { type: Boolean, default: false, required: false },
    readonly: { type: Boolean, default: true, required: false },
    required: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    value: {
      get() {
        return this.$attrs.value
      },
      set(v) {
        if (Array.isArray(v)) v.sort((a, b) => (a < b ? -1 : 1))
        this.$emit('input', v)
      },
    },
  },
}
</script>

<template>
  <g-combobox
    v-bind="{ ...$props, ...$attrs }"
    :chips="multiple"
    :dense="!multiple"
    :required="dialog ? false : required"
    :small-chips="multiple"
    append-icon=""
    v-on="$listeners"
  >
    <template #append-outer>
      <v-dialog
        ref="dialog"
        v-model="dialog"
        :return-value.sync="value"
        width="290px"
      >
        <template #activator="{ attrs, on }">
          <v-icon v-bind="attrs" color="primary" v-on="on">mdi-calendar</v-icon>
        </template>
        <g-date-picker v-model="value" :multiple="multiple" no-title>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="dialog = false"> Cancel </v-btn>
          <v-btn text color="primary" @click="$refs.dialog.save(value)">
            OK
          </v-btn>
        </g-date-picker>
      </v-dialog>
    </template>
  </g-combobox>
</template>

<style></style>
