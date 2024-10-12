<script>
/**
 * ## GDataTableDailyAttendances
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-12 - 初版作成
 */
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
dayjs.extend(utc)
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {}
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      if (this.$vuetify.breakpoint.lgAndUp) {
        return [
          { text: '日付', value: 'date' },
          { text: '区分', value: 'dayType', align: 'center' },
          {
            text: '始業時刻',
            value: 'startTimeFormatted',
            align: 'center',
          },
          {
            text: '終業時刻',
            value: 'endTimeFormatted',
            align: 'center',
          },
          { text: '休憩時間', value: 'breakMinutes', align: 'right' },
          { text: '所定内', value: 'scheduledWorkingMinutes', align: 'right' },
          { text: '法定内', value: 'statutoryOvertimeMinutes', align: 'right' },
          {
            text: '法定外',
            value: 'nonStatutoryOvertimeMinutes',
            align: 'right',
          },
          { text: '休日', value: 'holidayWorkingMinutes', align: 'right' },
          { text: '深夜', value: 'nighttimeWorkingMinutes', align: 'right' },
        ]
      } else if (this.$vuetify.breakpoint.md) {
        return [
          { text: '日付', value: 'date' },
          { text: '区分', value: 'dayType', align: 'center' },
          {
            text: '始業時刻',
            value: 'startTimeFormatted',
            align: 'center',
          },
          {
            text: '終業時刻',
            value: 'endTimeFormatted',
            align: 'center',
          },
          { text: '休憩時間', value: 'breakMinutes', align: 'right' },
          { text: '所定内', value: 'scheduledWorkingMinutes', align: 'right' },
          { text: '法定内', value: 'statutoryOvertimeMinutes', align: 'right' },
          {
            text: '法定外',
            value: 'nonStatutoryOvertimeMinutes',
            align: 'right',
          },
          { text: '休日', value: 'holidayWorkingMinutes', align: 'right' },
          { text: '深夜', value: 'nighttimeWorkingMinutes', align: 'right' },
        ]
      } else if (this.$vuetify.breakpoint.sm) {
        return [
          { text: '日付', value: 'date' },
          { text: '区分', value: 'dayType', align: 'center' },
          {
            text: '始業・終業',
            value: 'startEnd',
            align: 'center',
          },
          { text: '休憩時間', value: 'breakMinutes', align: 'right' },
          { text: '所定内', value: 'scheduledWorkingMinutes', align: 'right' },
          { text: '法定内', value: 'statutoryOvertimeMinutes', align: 'right' },
          {
            text: '法定外',
            value: 'nonStatutoryOvertimeMinutes',
            align: 'right',
          },
          { text: '休日', value: 'holidayWorkingMinutes', align: 'right' },
          { text: '深夜', value: 'nighttimeWorkingMinutes', align: 'right' },
        ]
      } else {
        return [
          { text: '日付', value: 'date' },
          { text: '区分', value: 'dayType', align: 'center' },
          {
            text: '始業・終業',
            value: 'startEnd',
            align: 'center',
          },
          { text: '休憩時間', value: 'breakMinutes', align: 'right' },
          { text: '所定内', value: 'scheduledWorkingMinutes', align: 'right' },
          { text: '法定内', value: 'statutoryOvertimeMinutes', align: 'right' },
          {
            text: '法定外',
            value: 'nonStatutoryOvertimeMinutes',
            align: 'right',
          },
          { text: '休日', value: 'holidayWorkingMinutes', align: 'right' },
          { text: '深夜', value: 'nighttimeWorkingMinutes', align: 'right' },
        ]
      }
    },
    arrangedItems() {
      return this.$attrs.items
        .map((item) => {
          return {
            ...item,
            startTimeFormatted: item?.startTime
              ? dayjs(item.startTime).utc().format('HH:mm')
              : null,
            endTimeFormatted: item?.endTime
              ? dayjs(item.endTime).utc().format('HH:mm')
              : null,
          }
        })
        .sort((a, b) => {
          if (a.date < b.date) return -1
          if (a.date > b.date) return 1
          return 0
        })
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="$attrs"
    :headers="headers"
    :items="arrangedItems"
    :mobile-breakpoint="0"
    disable-sort
    v-on="$listeners"
  >
    <template #[`item.dayType`]="{ item }">
      {{ $DAY_TYPE[item.dayType] }}
    </template>
    <template #[`item.startEnd`]="{ item }">
      <div>{{ item.startTimeFormatted }}</div>
      <div>{{ item.endTimeFormatted }}</div>
    </template>
    <template #[`item.breakMinutes`]="{ item }">
      {{
        `${(item.breakMinutes / 60).toFixed(2)} ${
          $vuetify.breakpoint.lgAndUp ? 'H' : ''
        }`
      }}
    </template>
    <template #[`item.scheduledWorkingMinutes`]="{ item }">
      {{
        `${(item.scheduledWorkingMinutes / 60).toFixed(2)} ${
          $vuetify.breakpoint.lgAndUp ? 'H' : ''
        }`
      }}
    </template>
    <template #[`item.statutoryOvertimeMinutes`]="{ item }">
      {{
        `${(item.statutoryOvertimeMinutes / 60).toFixed(2)} ${
          $vuetify.breakpoint.lgAndUp ? 'H' : ''
        }`
      }}
    </template>
    <template #[`item.nonStatutoryOvertimeMinutes`]="{ item }">
      {{
        `${(item.nonStatutoryOvertimeMinutes / 60).toFixed(2)} ${
          $vuetify.breakpoint.lgAndUp ? 'H' : ''
        }`
      }}
    </template>
    <template #[`item.holidayWorkingMinutes`]="{ item }">
      {{
        `${(item.holidayWorkingMinutes / 60).toFixed(2)} ${
          $vuetify.breakpoint.lgAndUp ? 'H' : ''
        }`
      }}
    </template>
    <template #[`item.nighttimeWorkingMinutes`]="{ item }">
      {{
        `${(item.nighttimeWorkingMinutes / 60).toFixed(2)} ${
          $vuetify.breakpoint.lgAndUp ? 'H' : ''
        }`
      }}
    </template>
  </g-data-table>
</template>

<style></style>
