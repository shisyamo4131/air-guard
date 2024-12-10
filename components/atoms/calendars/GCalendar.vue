<script>
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * カレンダーの色です。
     */
    color: { type: String, default: 'primary', required: false }, // カレンダーの色

    /**
     * カレンダーの日の表示形式です。
     */
    dayFormat: {
      type: Function,
      default: (timestamp) => new Date(timestamp.date).getDate(), // 日付のフォーマット関数
      required: false,
    },

    /**
     * 前へボタンを使用不可にします。
     */
    disableNext: { type: Boolean, default: false, required: false },

    /**
     * 次へボタンを使用不可にします。
     */
    disablePrev: { type: Boolean, default: false, required: false },

    /**
     * 今日へボタンを使用不可にします。
     */
    disableToday: { type: Boolean, default: false, required: false },

    /**
     * ヘッダーを非表示にします。
     */
    hideDefaultHeader: { type: Boolean, default: false, required: false },

    /**
     * 今日へボタンを非表示にします。
     */
    hideTodayBtn: { type: Boolean, default: false, required: false },

    /**
     * カレンダーのロケールです。既定値を日本にしています。
     */
    locale: { type: String, default: 'ja-jp', required: false }, // ロケールの設定

    /**
     * カレンダーの日の表示形式です。
     */
    monthFormat: {
      type: Function,
      default: (timestamp) => new Date(timestamp.date).getMonth() + 1 + ' /', // 月のフォーマット関数
      required: false,
    },

    /**
     * 次へボタンのアイコンです。
     */
    nextIcon: { type: String, default: 'mdi-chevron-right', required: false },

    /**
     * 前へボタンのアイコンです。
     */
    prevIcon: { type: String, default: 'mdi-chevron-left', required: false },

    /**
     * 今日へボタンのアイコンです。
     */
    todayIcon: { type: String, default: 'mdi-target', required: false },

    /**
     * カレンダーの表示形式です。
     */
    type: { type: String, default: 'month', required: false },

    /**
     * カレンダーの表示期間を指定する YYYY-MM-DD 形式の日付です。
     * 未指定の場合、当日日付を含む期間が初期表示されます。
     * カレンダーの表示期間が切り替わると更新され、input イベントで取得することができます。
     */
    value: { type: String, default: undefined, required: false },

    /**
     * カレンダーに表示する曜日および順序を定義です。
     * 0を日曜日、6を土曜日として配列で指定します。
     */
    weekdays: {
      type: Array,
      default: () => [1, 2, 3, 4, 5, 6, 0], // 曜日の表示順序
      required: false,
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * コンポーネント内部で管理する value です。
       * 初期値は当日日付で props.value と同期されます。
       */
      internalValue: this.$dayjs().format('YYYY-MM-DD'),
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * カレンダーの value プロパティとバインドされる値です。
     */
    computedValue: {
      get() {
        return this.internalValue
      },
      set(v) {
        this.internalValue = v
        this.$emit('input', v)
      },
    },

    /**
     * data.internalValue の年月を返します。
     * - props.typeが`month`の場合、data.internalValue をそのまま使用します。
     * - props.typeが`month`以外の場合、props.weekdaysで指定されている最初の日まで
     *   data.internalValue を遡り、年月を返します。
     */
    month() {
      const Dayjs = this.$dayjs(this.internalValue)

      if (this.type === 'month') return Dayjs.format('YYYY-MM')

      // 曜日を取得 (0: 日曜日, 1: 月曜日, ..., 6: 土曜日)
      const weekday = Dayjs.day()

      // weekdays[0] を参照して目標の曜日を取得
      const targetWeekday = this.weekdays[0]

      // 目標の曜日まで遡る
      const adjustedDayjs = Dayjs.subtract(
        (weekday - targetWeekday + 7) % 7,
        'day'
      )

      return adjustedDayjs.format('YYYY-MM')
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.internalValueに同期させます。
     */
    value: {
      handler(v) {
        if (!v) return
        this.internalValue = v
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * カレンダーの表示を前月（表示形式に応じる）にします。
     */
    prev() {
      this.$refs.calendar.prev()
      this.$emit('click:prev')
    },

    /**
     * カレンダーの表示を今日にします。
     */
    today() {
      this.computedValue = this.$dayjs().format('YYYY-MM-DD')
    },

    /**
     * カレンダーの表示を次月（表示形式に応じる）にします。
     */
    next() {
      this.$refs.calendar.next()
      this.$emit('click:next')
    },
  },
}
</script>

<template>
  <div class="d-flex flex-column">
    <slot
      v-if="!hideDefaultHeader"
      name="header"
      v-bind="{
        disablePrev,
        disableNext,
        disableToday,
        month,
        next,
        prev,
        today,
        value: internalValue,
      }"
    >
      <!-- TOOLBAR -->
      <v-toolbar dense flat>
        <!-- SLOT:prev-btn -->
        <slot
          name="prev-btn"
          v-bind="{ attrs: { disabled: disablePrev }, on: { click: prev } }"
        >
          <v-btn :disabled="disablePrev" icon @click="prev">
            <v-icon>{{ prevIcon }}</v-icon>
          </v-btn>
        </slot>

        <!-- SLOT:month -->
        <slot name="month" v-bind="{ month, value: internalValue }">
          <span>{{ month }}</span>
        </slot>

        <!-- SLOT:next-btn -->
        <slot
          name="next-btn"
          v-bind="{ attrs: { disabled: disableNext }, on: { click: next } }"
        >
          <v-btn :disabled="disableNext" icon @click="next">
            <v-icon>{{ nextIcon }}</v-icon>
          </v-btn>
        </slot>

        <!-- SLOT:today-btn -->
        <slot
          v-if="!hideTodayBtn"
          name="today-btn"
          v-bind="{ attrs: { disabled: disableToday }, on: { click: today } }"
        >
          <v-btn :disabled="disableToday" icon @click="today">
            <v-icon>{{ todayIcon }}</v-icon>
          </v-btn>
        </slot>

        <!-- SLOT:append-toolbar -->
        <slot name="append-toolbar" />
      </v-toolbar>
    </slot>

    <!-- CALENDAR -->
    <v-calendar
      v-bind="$attrs"
      ref="calendar"
      v-model="computedValue"
      :color="color"
      :day-format="dayFormat"
      :locale="locale"
      :month-format="monthFormat"
      :type="type"
      :weekdays="weekdays"
      v-on="$listeners"
    >
      <!-- provide all slots of v-calendar -->
      <template
        v-for="(_, scopedSlotName) in $scopedSlots"
        #[scopedSlotName]="slotData"
      >
        <slot :name="scopedSlotName" v-bind="slotData" />
      </template>
      <template v-for="(_, slotName) in $slots" #[slotName]>
        <slot :name="slotName" />
      </template>
    </v-calendar>
  </div>
</template>

<style></style>
