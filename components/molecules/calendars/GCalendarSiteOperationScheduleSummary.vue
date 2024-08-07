<script>
/**
 * ### GCalendarSiteOperationScheduleSummary
 *
 * 現場の稼働予定を表示するためのカレンダーコンポーネントです。
 * 稼働予定情報は日付・勤務区分ごとに人数が集計されて表示されます。
 *
 * #### 機能詳細:
 * - 現場の稼働予定オブジェクトの配列を受け取り、日付・勤務区分ごとに人数を集計してカレンダーに表示します。
 * - イベントラベルをクリックすると`click:schedule`イベントがemitされます。
 * - `click:schedule`イベントには {date, workShift} が含まれます。
 *
 * #### 注意事項:
 * - 日付・勤務区分ごとに人数が集計されるため、現場の稼働予定ドキュメントをemitすることはできません。
 *
 * @params {Array} items - 現場の稼働予定オブジェクトの配列
 *
 * @updates
 * - version 1.0.0 - 2024-07-12 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.0.0
 */
import GCalendar from '../../atoms/calendars/GCalendar.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCalendar },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    items: { type: Array, default: () => [], required: false },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
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
    prev() {
      this.$refs.calendar.prev()
    },
    next() {
      this.$refs.calendar.next()
    },
  },
}
</script>

<template>
  <g-calendar v-bind="$attrs" ref="calendar" v-on="$listeners">
    <template #day="{ date }">
      <div v-if="events[date]" class="d-flex flex-wrap pa-1" style="gap: 4px">
        <div style="height: 16px; width: 100%">
          <v-sheet
            v-if="events[date].day > 0"
            color="blue lighten-2"
            width="100%"
            height="100%"
            rounded
            class="d-flex align-center justify-center white--text text-caption"
            style="cursor: pointer"
            @click="$emit('click:schedule', { date, workShift: 'day' })"
          >
            {{ events[date].day }}
          </v-sheet>
        </div>
        <div style="height: 16px; width: 100%">
          <v-sheet
            v-if="events[date].night > 0"
            color="red lighten-2"
            width="100%"
            height="100%"
            rounded
            class="d-flex align-center justify-center white--text text-caption"
            style="cursor: pointer"
            @click="$emit('click:schedule', { date, workShift: 'night' })"
          >
            {{ events[date].night }}
          </v-sheet>
        </div>
      </div>
    </template>
  </g-calendar>
</template>

<style></style>
