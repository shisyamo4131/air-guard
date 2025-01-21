<script>
/**
 * 現場稼働予定専用のカレンダーコンポーネントです。
 * - props.items で受け取った現場稼働予定からカレンダー上に表示するための
 *   events を内部で生成しています。
 * @author shisyamo4131
 * @refact 2025-01-21
 */
import GCalendarV2 from './GCalendarV2.vue'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCalendarV2 },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 現場稼働予定ドキュメントのインスタンスの配列を受け取ります。
     */
    items: {
      type: Array,
      default: () => [],
      required: false,
      validator: (v) => {
        return (
          Array.isArray(v) &&
          v.every((item) => item instanceof SiteOperationSchedule)
        )
      },
    },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * props.items で受け取った現場稼働予定ドキュメントの配列を
     * Calendar コンポーネント用のevents 配列に変換して返します。
     * - item プロパティで稼働予定ドキュメントにアクセス可能です。
     */
    events() {
      return this.items.map((item) => {
        const name = item.isClosed
          ? '休工'
          : item.qualification
          ? `★${item.requiredWorkers}名`
          : `${item.requiredWorkers}名`
        const start = item.isClosed
          ? new Date(`${item.date}`)
          : new Date(`${item.date}T${item.startTime}`)
        const end = item.isClosed
          ? new Date(`${item.date}`)
          : new Date(`${item.date}T${item.endTime}`)
        const color = item.workShift === 'day' ? 'info' : 'accent'
        return { name, start, end, color, item }
      })
    },
  },
}
</script>

<template>
  <g-calendar-v-2 v-bind="$attrs" :events="events" v-on="$listeners" />
</template>

<style></style>
