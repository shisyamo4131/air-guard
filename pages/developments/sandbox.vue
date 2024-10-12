<template>
  <v-container>
    <v-card>
      <g-data-table-daily-attendances
        :items="arrangedItems.length ? arrangedItems[1].dailyAttendances : []"
      />
    </v-card>
  </v-container>
</template>

<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import MonthlyAttendance from '~/models/MonthlyAttendance'
import GDataTableDailyAttendances from '~/components/molecules/tables/GDataTableDailyAttendances.vue'
dayjs.extend(utc)
export default {
  components: { GDataTableDailyAttendances },
  data() {
    return {
      headers: [
        { text: '日付', value: 'date' },
        { text: '区分', value: 'dayType' },
        { text: '始業時刻', value: 'startTimeFormatted' },
        { text: '終業時刻', value: 'endTimeFormatted' },
        { text: '休憩時間', value: 'breakMinutes' },
        { text: '所定内', value: 'scheduledWorkingMinutes' },
        { text: '法定内', value: 'statutoryOvertimeMinutes' },
        { text: '法定外', value: 'nonStatutoryOvertimeMinutes' },
        { text: '休日', value: 'holidayWorkingMinutes' },
        { text: '深夜', value: 'nighttimeWorkingMinutes' },
      ],
      items: [],
      listener: new MonthlyAttendance(),
    }
  },
  computed: {
    arrangedItems() {
      return this.items.map((item) => {
        const dailyAttendances = item.dailyAttendances.map((daily) => {
          return {
            ...daily,
            startTimeFormatted: daily?.startTime
              ? dayjs(daily.startTime).utc().format('HH:mm')
              : null,
            endTimeFormatted: daily?.endTime
              ? dayjs(daily.endTime).utc().format('HH:mm')
              : null,
          }
        })
        return { ...item, dailyAttendances }
      })
    },
  },
  mounted() {
    this.items = this.listener.subscribeDocs([
      ['where', 'month', '==', '2024-10'],
    ])
  },
}
</script>

<style></style>
