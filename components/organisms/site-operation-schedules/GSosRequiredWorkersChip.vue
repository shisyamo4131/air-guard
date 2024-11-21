<script>
/**
 * 稼働予定管理で使用する稼働数表示用の関数型コンポーネントです。
 *
 * - 稼働予定管理で数百以上描画されるコンポーネントであるため、関数型コンポーネントで実装しています。
 *
 * NOTE: 稼働予定の数が多く、検索（find）に時間がかかる場合は親コンポーネントで MAP にしておくと改善できるかも。
 *
 * ```
 * const scheduleMap = schedules.reduce((map, schedule) => {
 *   const key = `${schedule.date}-${schedule.siteId}-${schedule.workShift}`;
 *   map[key] = schedule;
 *   return map;
 * }, {});
 * ```
 * @author shisyamo4131
 */
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
export default {
  functional: true,

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    date: { type: String, required: true },
    siteId: { type: String, required: true },
    workShift: { type: String, required: true },
    schedules: { type: Array, default: () => [], required: false },
  },

  /***************************************************************************
   * RENDER
   ***************************************************************************/
  render(h, context) {
    const { props, listeners } = context
    const { date, siteId, workShift, schedules } = props

    // スケジュール検索
    const schedule = schedules.find(
      (schedule) =>
        schedule.date === date &&
        schedule.siteId === siteId &&
        schedule.workShift === workShift
    )

    // 色とラベルを取得
    const color = workShift === 'day' ? 'blue white--text' : 'red white--text'
    const label = schedule ? schedule.requiredWorkers || '休工' : '-'

    /**
     * click イベントを emit します。
     * - 引数 schedule が指定されていない場合、新しい稼働予定インスタンスを生成して emit します。
     */
    const emitClickEvent = (schedule = null) => {
      const instance =
        schedule ||
        new SiteOperationSchedule({ dates: [date], siteId, workShift })
      if (listeners.click) {
        listeners.click(instance)
      } else {
        // eslint-disable-next-line no-console
        console.warn('Click listener is not defined')
      }
    }

    // レンダリング
    const isScheduleExist = !!schedule
    return h(
      isScheduleExist ? 'v-chip' : 'v-btn',
      {
        props: isScheduleExist
          ? { color, outlined: !schedule.qualification, small: true }
          : { text: true, xSmall: true },
        on: { click: () => emitClickEvent(schedule) },
      },
      label
    )
  },
}
</script>
