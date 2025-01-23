<script>
/**
 * 日付選択用のダイアログピッカーコンポーネントです。
 * @author shisyamo4131
 * @refact 2025-01-23
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

    /**
     * ダイアログを再度開いたときに当月が表示されるようになります。
     * 既定値は true です。
     * false にすると、最後に閉じた月が表示されます。
     */
    initCurrentMonth: { type: Boolean, default: true, required: false },

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
      pickerDate: this.$dayjs().format('YYYY-MM'),
      internalValue: undefined,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * コンポーネント内部で使用する value です。ダイアログの return-value と バインドされます。
     * DatePicker で行われた日付操作は data.internalValue に反映されます。
     * DatePicker で確定された日付が return-value.sync で computedValue に引き渡されます。
     * 引き渡された値は setter でイベントとして emit されるのみです。
     */
    computedValue: {
      get() {
        return this.internalValue
      },
      set(v) {
        this.$emit('input', v)
        this.$emit('change', v)
      },
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.dialog を監視します。
     * - ダイアログ終了時、props.initCurrentMonth が true の場合は
     *   ピッカーの表示年月を当月に戻します。
     * - data.internalValue を props.value で初期化します。
     *   この処理がないと、日付選択 -> キャンセル -> 再度開いたときに
     *   ピッカーの日付（internalValue）と入力値（value）に相違が発生します。
     */
    dialog(v) {
      if (v) return
      if (this.initCurrentMonth) {
        this.pickerDate = this.$dayjs().format('YYYY-MM')
      }
      this.internalValue = this.value
    },

    /**
     * props.value を監視します。
     * - data.internalValue と同期します。
     */
    value: {
      handler(v) {
        this.internalValue = v
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
      v-model="internalValue"
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
        @click="$refs.dialog.save(internalValue)"
      />
    </g-date-picker>
  </v-dialog>
</template>

<style></style>
