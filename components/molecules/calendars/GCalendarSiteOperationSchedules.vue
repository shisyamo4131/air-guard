<script>
/**
 * ### GCalendarSiteOperationSchedules
 *
 * 単一現場の稼働予定を表示するためのカレンダーコンポーネントです。
 *
 * #### 機能詳細:
 * - 現場の稼働予定オブジェクトの配列を受け取り、VCalenderのイベントラベルに稼働予定情報を表示します。
 * - 他のGDataTableコンポーネントに合わせて、イベントラベルをクリックすると`click:edit`イベントがemitされます。
 * - `click:edit`イベントには {date, workShift} が含まれます。
 *
 * @params {Array} items - 現場の稼働予定オブジェクトの配列
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-17 - 初版作成
 */
import GCalendar from '../../atoms/calendars/GCalendar.vue'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCalendar },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * SiteOperationSchedulesドキュメントの配列
     */
    items: {
      type: Array,
      default: () => [],
      required: false,
      validator: (v) =>
        v.length || v.every((item) => item instanceof SiteOperationSchedule),
    },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * Calendarコンポーネントで使用するevents
     * - dayスロットを使用しているため、Calendarコンポーネントのeventsプロパティは使用してません。
     * - 単一現場の稼働予定を想定しているので、稼働予定日、勤務区分でサマリーする必要は本来ありません。
     */
    events() {
      return this.items.reduce((acc, i) => {
        const date = i.date
        if (!(date in acc)) acc[date] = { day: 0, night: 0, total: 0 }
        acc[date][i.workShift] += i.requiredWorkers
        acc[date][i.total] += i.requiredWorkders
        return acc
      }, {})
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * Calendarコンポーネントのprevメソッドです。
     */
    prev() {
      this.$refs.calendar.prev()
    },
    /**
     * Calendarコンポーネントのnextメソッドです。
     */
    next() {
      this.$refs.calendar.next()
    },
    /**
     * Calendarコンポーネントのイベントラベルがクリックされた時の処理です。
     * - date、workShiftを受け取り、`props.items`から該当する現場稼働予定データを抽出
     * - 抽出した現場稼働予定データを`click:edit`イベントともにemitします。
     */
    onClickSchedule({ date, workShift }) {
      const item = this.items.find((item) => {
        return item.date === date && item.workShift === workShift
      })
      if (!item) {
        // eslint-disable-next-line no-console
        console.error('現場の稼働予定が配列に存在しません。', {
          date,
          workShift,
        })
      }
      this.$emit('click:edit', item)
    },
  },
}
</script>

<template>
  <g-calendar v-bind="$attrs" ref="calendar" v-on="$listeners">
    <template #day="{ date }">
      <div class="d-flex flex-wrap pa-1" style="gap: 4px">
        <div style="height: 16px; width: 100%">
          <v-sheet
            v-if="events?.[date] && events[date].day > 0"
            color="blue lighten-2"
            width="100%"
            height="100%"
            rounded
            class="d-flex align-center justify-center white--text text-caption"
            style="cursor: pointer"
            @click="onClickSchedule({ date, workShift: 'day' })"
          >
            {{ events[date].day }}
          </v-sheet>
        </div>
        <div style="height: 16px; width: 100%">
          <v-sheet
            v-if="events?.[date] && events[date].night > 0"
            color="red lighten-2"
            width="100%"
            height="100%"
            rounded
            class="d-flex align-center justify-center white--text text-caption"
            style="cursor: pointer"
            @click="onClickSchedule({ date, workShift: 'night' })"
          >
            {{ events[date].night }}
          </v-sheet>
        </div>
      </div>
    </template>
  </g-calendar>
</template>

<style></style>
