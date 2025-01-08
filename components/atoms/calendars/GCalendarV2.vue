<script>
/**
 * プロジェクトで使用するカレンダーコンポーネントです。
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * カレンダーの日の表示形式です。
     */
    dayFormat: {
      type: Function,
      default: (timestamp) => new Date(timestamp.date).getDate(), // 日付のフォーマット関数
      required: false,
    },

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
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * カレンダーの表示を前月（表示形式に応じる）にします。
     */
    prev() {
      this.$refs.calendar.prev()
    },

    /**
     * カレンダーの表示を次月（表示形式に応じる）にします。
     */
    next() {
      this.$refs.calendar.next()
    },
  },
}
</script>

<template>
  <v-calendar
    v-bind="{ ...$props, ...$attrs }"
    ref="calendar"
    v-on="$listeners"
  />
</template>

<style></style>
