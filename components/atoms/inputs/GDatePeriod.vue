<script>
/**
 * ## GDatePeriod
 *
 * 期間選択コンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-08-15 - 初版作成
 */
import ja from 'dayjs/locale/ja'
import GDatePicker from '../pickers/GDatePicker.vue'
import GTextField from './GTextField.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, GDatePicker },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    maxDays: { type: Number, default: null, required: false },
    rules: { type: Array, default: () => [], required: false },
    value: { type: Array, default: () => [], required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      maxDaysRule: (v) =>
        !this.maxDays ||
        !v.length ||
        this.daysCount <= this.maxDays ||
        `${this.maxDays}日以内で指定してください。`,

      dates: [],
      dialog: false,
      pickerDate: this.$dayjs().format('YYYY-MM-DD'),
      verified: false,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    daysCount() {
      if (this.dates.length < 2) return 0
      const [from, to] = this.dates.toSorted()
      return this.$dayjs(to).diff(this.$dayjs(from), 'day') + 1
    },
    text() {
      if (!this.value.length) return ''
      if (this.value.length === 1) return ''
      const from = this.$dayjs(this.value[0])
        .locale(ja)
        .format('YYYY年MM月DD日(dd)')
      const to = this.$dayjs(this.value[1])
        .locale(ja)
        .format('YYYY年MM月DD日(dd)')
      return `${from} ~ ${to}`
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (v) return
      if (!this.value.length) {
        this.pickerDate = this.$dayjs().format('YYYY-MM-DD')
      } else {
        this.pickerDate = this.value[0]
      }
      this.dates = [...this.value]
    },
    value: {
      handler(newVal, oldVal) {
        if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
        this.dates = [...newVal]
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    submit() {
      if (!this.$refs.form.validate()) return
      this.$emit('input', this.dates.toSorted())
      this.dialog = false
    },
  },
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="290">
    <template #activator="{ attrs, on }">
      <div style="width: 372px">
        <g-text-field
          v-bind="{ ...$attrs, ...attrs }"
          :value="text"
          prepend-inner-icon="mdi-calendar"
          readonly
          v-on="on"
        />
      </div>
    </template>
    <v-card>
      <v-form ref="form">
        <g-date-picker
          v-model="dates"
          no-title
          range
          :picker-date.sync="pickerDate"
          @change="submit"
        />
        <div class="pa-4">
          <v-input
            :value="dates"
            :rules="[maxDaysRule, ...rules]"
            hint="画面外クリックでキャンセル"
            persistent-hint
          />
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<style></style>
