<script>
import { VCalendar } from 'vuetify/lib'

/**
 * ### GCalendar.vue
 * @version 1.0.0
 * @create 2024-06-20
 * @author shisyamo4131
 *
 * 概要:
 * GCalendarコンポーネントは、VuetifyのVCalendarを拡張し、カスタマイズされたカレンダーを提供します。
 *
 * 主な機能:
 * - カレンダーの色やフォーマットをカスタマイズ可能
 * - 日本のロケールに対応
 * - 曜日の表示順序をカスタマイズ可能
 *
 * 使用例:
 * <GCalendar :color="'secondary'" :locale="'en-us'" />
 *
 * props設定:
 * - color: カレンダーの色を指定
 * - dayFormat: 日付のフォーマットを指定する関数
 * - locale: カレンダーのロケールを指定
 * - monthFormat: 月のフォーマットを指定する関数
 * - weekdays: 曜日の表示順序を指定
 *
 * 更新履歴:
 * 2024-06-20 - 初版作成
 *
 * 注意事項:
 * このコンポーネントはVuetifyライブラリのVCalendarコンポーネントを拡張しています。
 */

export default {
  /***************************************************************************
   * EXTENDS
   ***************************************************************************/
  extends: VCalendar,
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    color: { type: String, default: 'primary', required: false }, // カレンダーの色
    dayFormat: {
      type: Function,
      default: (timestamp) => new Date(timestamp.date).getDate(), // 日付のフォーマット関数
      required: false,
    },
    locale: { type: String, default: 'ja-jp', required: false }, // ロケールの設定
    monthFormat: {
      type: Function,
      default: (timestamp) => new Date(timestamp.date).getMonth() + 1 + ' /', // 月のフォーマット関数
      required: false,
    },
    weekdays: {
      type: Array,
      default: () => [1, 2, 3, 4, 5, 6, 0], // 曜日の表示順序
      required: false,
    },
  },
}
</script>
