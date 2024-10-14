<template>
  <v-container>
    <div>
      <g-calendar-daily-attendances
        :items="items.length ? items[1].dailyAttendances : []"
      />
    </div>
  </v-container>
</template>

<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import MonthlyAttendance from '~/models/MonthlyAttendance'
import GCalendarDailyAttendances from '~/components/molecules/calendars/GCalendarDailyAttendances.vue'
dayjs.extend(utc)
export default {
  components: { GCalendarDailyAttendances },
  data() {
    return {
      items: [],
      listener: new MonthlyAttendance(),
    }
  },
  computed: {},
  mounted() {
    this.items = this.listener.subscribeDocs([
      ['where', 'month', '==', '2024-10'],
    ])
  },
}
</script>

<style></style>
