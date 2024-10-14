<script>
/**
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-14 - 初版作成
 */
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import GCalendar from '~/components/atoms/calendars/GCalendar.vue'
import GChipDayType from '~/components/atoms/chips/GChipDayType.vue'
dayjs.extend(utc)

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCalendar, GChipDayType },

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
      return this.items.reduce((acc, item) => {
        const startTimeFormatted = item?.startTime
          ? dayjs(item.startTime).utc().format('HH:mm')
          : null
        const endTimeFormatted = item?.endTime
          ? dayjs(item.endTime).utc().format('HH:mm')
          : null
        acc[item.date] = { ...item, startTimeFormatted, endTimeFormatted }
        return acc
      }, {})
    },
  },
}
</script>

<template>
  <g-calendar
    v-bind="$attrs"
    id="g-calendar-daily-attendances"
    v-on="$listeners"
  >
    <template #day="{ date }">
      <div
        v-if="events[date]"
        class="container px-2 py-0"
        style="min-height: 72px"
      >
        <!-- dayType and attendanceStatus -->
        <div class="text-caption d-flex flex-wrap justify-space-between">
          <div>
            <!-- {{ $DAY_TYPE[events[date].dayType] }} -->
            <g-chip-day-type x-small label :value="events[date].dayType" />
          </div>
          <div v-if="events[date].attendanceStatus">
            {{ $ATTENDANCE_STATUS[events[date].attendanceStatus].short }}
          </div>
        </div>
        <div v-if="events[date].attendanceStatus === 'present'">
          <!-- time -->
          <div class="text-caption">
            <v-icon left small>mdi-clock-outline</v-icon>
            {{
              `${events[date].startTimeFormatted} - ${events[date].endTimeFormatted}`
            }}
          </div>
          <!-- minutes -->
          <div class="text-caption d-flex">
            <div class="flex-grow-1 text-center">
              {{ `${events[date].scheduledWorkingHours.toFixed(2)}` }}
            </div>
            <div class="flex-grow-1 text-center">
              {{ `${events[date].breakHours.toFixed(2)}` }}
            </div>
            <div class="flex-grow-1 text-center">
              {{ `${events[date].nonStatutoryOvertimeHours.toFixed(2)}` }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </g-calendar>
</template>

<style></style>
