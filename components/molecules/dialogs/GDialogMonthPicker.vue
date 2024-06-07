<script>
import GBtnCancelIcon from '../btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '../btns/GBtnSubmitIcon.vue'
import GDatePicker from '~/components/atoms/pickers/GDatePicker.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
/**
 * ### GDialogMonthPicker
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDatePicker, GBtnCancelIcon, GBtnSubmitIcon, GTextField },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    value: { type: String, default: undefined, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      pickerDate: undefined,
      internalValue: undefined,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    computedValue: {
      get() {
        return this.internalValue
      },
      set(v) {
        this.internalValue = v
        this.$emit('input', v)
      },
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (!v) this.pickerDate = undefined
    },
    value: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.internalValue = newVal
      },
      immediate: true,
    },
  },
}
</script>

<template>
  <v-dialog
    ref="dialog"
    v-model="dialog"
    persistent
    :return-value.sync="computedValue"
    width="290"
  >
    <template #activator="{ attrs, on }">
      <g-text-field
        v-bind="{ ...$attrs, ...attrs }"
        :value="value"
        class="center-input"
        style="min-width: 96px; max-width: 96px"
        hide-details
        label="年月"
        readonly
        v-on="{ ...$listeners, ...on }"
      />
    </template>
    <g-date-picker
      v-model="internalValue"
      :picker-date.sync="pickerDate"
      type="month"
      no-title
    >
      <g-btn-cancel-icon @click="dialog = false" />
      <v-spacer />
      <g-btn-submit-icon
        color="primary"
        @click="$refs.dialog.save(internalValue)"
      />
    </g-date-picker>
  </v-dialog>
</template>

<style></style>
