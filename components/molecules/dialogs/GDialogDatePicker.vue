<script>
/**
 * ### GDialogDatePicker
 * 日付選択用のダイアログピッカーコンポーネントです。
 *
 * GDialogMonthPickerが不要では・・・・？
 *
 * @component
 * @example
 * <GDialogDatePicker v-model="value" />
 *
 * @props {String} value - v-modelバインディング用の月データ
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.1.0 - 2024-10-07 - `allowedDates` プロパティを実装。
 * - version 1.0.0 - 2024-09-07 - 初版作成
 */
import GBtnCancel from '../../atoms/btns/GBtnCancel.vue'
import GBtnSubmit from '../../atoms/btns/GBtnSubmit.vue'
import GDatePicker from '~/components/atoms/pickers/GDatePicker.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDatePicker, GBtnCancel, GBtnSubmit },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    allowedDates: { type: Function, default: null, required: false },
    type: {
      type: String,
      default: 'date',
      validator: (v) => ['date', 'month'].includes(v),
      required: false,
    },
    value: { type: [Array, String], default: undefined, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      pickerDate: undefined,
      pickerValue: undefined,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    computedValue: {
      get() {
        return this.pickerValue
      },
      set(v) {
        if (this.pickerValue === this.value) return
        this.$emit('input', v)
        this.$emit('change', v)
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
        this.pickerValue = newVal
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
      <slot
        name="activator"
        v-bind="{
          attrs: { ...attrs, readonly: true, value },
          on,
        }"
      />
    </template>
    <g-date-picker
      v-model="pickerValue"
      :allowed-dates="allowedDates"
      :picker-date.sync="pickerDate"
      :type="type"
      no-title
    >
      <g-btn-cancel icon @click="dialog = false" />
      <v-spacer />
      <g-btn-submit
        icon
        color="primary"
        @click="$refs.dialog.save(pickerValue)"
      />
    </g-date-picker>
  </v-dialog>
</template>

<style></style>
