<script>
import GSwitch from '../inputs/GSwitch.vue'
import GDatePicker from './GDatePicker.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDatePicker, GSwitch },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    value: { type: Array, default: () => [], required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      allowedDates: (v) => {
        const dayOfWeek = this.$dayjs(v).format('ddd').toLowerCase()
        return this.selectableDayOfWeeks.includes(dayOfWeek)
      },
      internalValue: [],
      isRange: false,
      selectableDayOfWeeks: ['mon', 'tue', 'wed', 'thu', 'fri'],
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    computedValue: {
      get() {
        if (!this.isRange || this.internalValue.length <= 1) {
          return this.internalValue
        } else {
          return [
            this.internalValue[0],
            this.internalValue[this.internalValue.length - 1],
          ]
        }
      },
      set(v) {
        if (!this.isRange || v.length <= 1) {
          this.internalValue = v
          this.$emit('input', v)
        } else {
          this.setValueAsRange(v[0], v[1])
        }
      },
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    value: {
      handler(newVal, oldVal) {
        this.forceUpdateSelectableDayOfWeek(newVal)
        this.internalValue = newVal
      },
      immediate: true,
    },
    isRange(newVal) {
      if (this.internalValue.length <= 1) return
      if (newVal) {
        const [from, ...rest] = [...this.internalValue].sort()
        this.setValueAsRange(from, rest[rest.length - 1])
      }
    },
    /**
     * selectableDayOfWeeks（選択可能な曜日）が変更された際の処理
     * [範囲選択モード]
     * 現在指定されている期間で選択可能な曜日に該当する全日付をvalueにセットする。
     * [個別選択モード]
     * 現在選択されている日付のうち、選択不可能な曜日に該当する日付を除外してvalueにセットする。
     */
    selectableDayOfWeeks(newVal, oldVal) {
      const result = this.internalValue.filter((date) => {
        const dayOfWeek = this.$dayjs(date).format('ddd').toLowerCase()
        return newVal.includes(dayOfWeek)
      })
      this.internalValue = result
      this.$emit('input', result)
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 開始日、終了日を受け取り、当該期間の全日付のうち、
     * 選択可能とされている曜日に該当する日付の配列をvalueにセットする。
     */
    setValueAsRange(from, to) {
      const [dayjsFrom, dayjsTo] = [this.$dayjs(from), this.$dayjs(to)]
      const dayCount = dayjsTo.diff(dayjsFrom, 'day') + 1
      const allDays = Array.from({ length: dayCount }, (_, i) =>
        dayjsFrom.add(i, 'day').format('YYYY-MM-DD')
      )
      const result = allDays.filter((date) => {
        const dayOfWeek = this.$dayjs(date).format('ddd').toLowerCase()
        return this.selectableDayOfWeeks.includes(dayOfWeek)
      })
      this.internalValue = [...result]
      this.$nextTick(() => this.$emit('input', [...result]))
    },
    /**
     * 日付文字列の配列を受け取ります。
     * 配列に含まれる日付から曜日を判断し、selectableDayOfWeeksに含まれていない
     * 曜日を強制的に追加します。
     */
    forceUpdateSelectableDayOfWeek(dates) {
      const requiredDayOfWeeks = [
        ...new Set(
          dates.map((date) => this.$dayjs(date).format('ddd').toLowerCase())
        ),
      ]
      requiredDayOfWeeks.forEach((dayOfWeek) => {
        if (!this.selectableDayOfWeeks.includes(dayOfWeek)) {
          this.selectableDayOfWeeks.push(dayOfWeek)
        }
      })
    },
  },
}
</script>

<template>
  <g-date-picker
    v-bind="$attrs"
    v-model="computedValue"
    color="primary"
    multiple
    :range="isRange"
    :allowed-dates="allowedDates"
    no-title
    v-on="$listeners"
  >
    <div>
      <g-switch v-model="isRange" class="mt-0" label="範囲選択" hide-details />
      <v-chip-group
        v-model="selectableDayOfWeeks"
        multiple
        active-class="primary--text"
        column
      >
        <v-chip small value="mon">月</v-chip>
        <v-chip small value="tue">火</v-chip>
        <v-chip small value="wed">水</v-chip>
        <v-chip small value="thu">木</v-chip>
        <v-chip small value="fri">金</v-chip>
        <v-chip small value="sat">土</v-chip>
        <v-chip small value="sun">日</v-chip>
      </v-chip-group>
    </div>
  </g-date-picker>
</template>

<style></style>
