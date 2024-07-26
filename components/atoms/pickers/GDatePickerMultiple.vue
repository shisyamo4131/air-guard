<script>
/**
 * ## GDatePickerMultiple
 *
 * 複数の日を選択可能なDatePickerコンポーネントです。
 *
 * ### 機能詳細
 * - 選択可能な曜日を指定することが可能です。
 * - Range（範囲）選択の切り替えを行うことができます。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.1.0 - 2024-07-06 - 各種設定をダイアログ上で行うUIに変更
 * - version 1.0.0 - 2024-06-21 - 初版作成
 */

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
      dialog: false,
      internalValue: [],
      isRange: false,
      multiFunctional: false,
      selectableDayOfWeeks: ['mon', 'tue', 'wed', 'thu', 'fri'],
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * v-date-pickerとバインドされるデータです。
     * getter:
     * 選択モードによってv-date-pickerに返す値が変わります。
     * [個別選択モード]
     * internalValueをそのまま返します。
     * [範囲選択モード]
     * internalValueの要素数が2未満であればinternalValueをそのまま返します。
     * internalValueの要素数が2以上であればinternalValueの最初の要素と最後の要素を配列にして返します。
     * setter:
     * 選択モードによってinternalValueにセットする値が変わります。
     * [個別選択モード]
     * 受け取った配列をそのままinternalValueにセットします。
     * [範囲選択モード]
     * 受け取った配列の要素数が2未満であればそのままinternalValueにセットします。
     * 受け取った配列の要素数が2以上であればsetInternalValueAsRange()によってinternalValueに値がセットされます。
     * -> 範囲選択モードの場合、配列の要素数は最大で2
     */
    pickerValue: {
      get() {
        if (!this.isRange) return this.internalValue
        if (this.internalValue.length < 2) return this.internalValue
        return [
          this.internalValue[0],
          this.internalValue[this.internalValue.length - 1],
        ]
      },
      set(v) {
        if (!this.isRange || v.length <= 1) {
          this.internalValue = v
          this.$emit('input', v)
        } else {
          v.sort() // 配列の要素を日付の昇順でソート
          this.setInternalValueAsRange(v[0], v[1])
        }
      },
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.internalValueを監視します。
     * - 変更があった場合、親コンポーネントのvalueと同期するためinputイベントをemitします。
     */
    internalValue(newVal, oldVal) {
      if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
      this.$emit('input', newVal)
    },
    multiFunctional(v) {
      if (!v) this.isRange = false
    },
    /**
     * props.valueの値を監視します。
     * - 親コンポーネントから受け取った日付の配列にはv-date-picker-multipleで選択不可となっている曜日に該当する日付が含まれている可能性があります。
     * - 該当する日付があった場合に当該曜日を強制的に選択可能にするため`forceUpdateSelectableDayOfWeek()`を呼び出します。
     * - data.internalValueに受け取った値をセットします。
     */
    value: {
      handler(newVal, oldVal) {
        if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
        this.forceUpdateSelectableDayOfWeek(newVal)
        this.internalValue = newVal
      },
      immediate: true,
    },
    isRange(newVal) {
      if (this.internalValue.length <= 1) return
      if (newVal) {
        const [from, ...rest] = [...this.internalValue].sort()
        this.setInternalValueAsRange(from, rest[rest.length - 1])
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
      if (this.isRange) {
        switch (this.pickerValue.length) {
          case 0:
          case 1:
            return
          default:
            this.setInternalValueAsRange(
              this.pickerValue[0],
              this.pickerValue[1]
            )
        }
      } else {
        const result = this.internalValue.filter((date) => {
          const dayOfWeek = this.$dayjs(date).format('ddd').toLowerCase()
          return newVal.includes(dayOfWeek)
        })
        this.internalValue = result
      }
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 開始日、終了日を受け取り、当該期間の全日付のうち、
     * 選択可能とされている曜日に該当する日付の配列をinternalValueにセットします。
     */
    setInternalValueAsRange(from, to) {
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
    },
    /**
     * 日付文字列の配列を受け取ります。
     * 配列に含まれる日付から曜日を判断し、selectableDayOfWeeks（選択可能な曜日を表す配列）に含まれていない曜日を強制的に追加します。
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
    v-model="pickerValue"
    style="width: 290px"
    color="primary"
    multiple
    :range="isRange"
    :allowed-dates="allowedDates"
    no-title
    v-on="$listeners"
  >
    <div class="flex-grow-1">
      <div class="d-flex justify-space-between">
        <div
          class="text-caption align-self-center"
          style="color: rgba(0, 0, 0, 0.6)"
        >
          <span>選択モード:</span>
          <v-btn icon small @click="isRange = false"
            ><v-icon color="blue" :disabled="isRange"
              >mdi-calendar-multiselect</v-icon
            ></v-btn
          >
          <v-btn class="ml-1" icon small @click="isRange = true">
            <v-icon color="green" :disabled="!isRange"
              >mdi-calendar-expand-horizontal</v-icon
            >
          </v-btn>
        </div>
        <v-dialog v-model="dialog" max-width="360">
          <template #activator="{ attrs, on }">
            <v-btn v-bind="attrs" icon small v-on="on"
              ><v-icon>mdi-cog-outline</v-icon></v-btn
            >
          </template>
          <v-card>
            <v-card-text class="pa-4">
              <h4>選択モード切替</h4>
              <v-divider class="my-2" />
              <g-switch
                v-model="isRange"
                class="mt-0 pt-0"
                label="範囲で選択"
                hide-details
              />
              <h4 class="mt-4">選択可能日</h4>
              <v-divider class="my-2" />
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
            </v-card-text>
          </v-card>
        </v-dialog>
      </div>
    </div>
  </g-date-picker>
</template>

<style></style>
