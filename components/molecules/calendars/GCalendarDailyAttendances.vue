<script>
/**
 * 従業員勤怠実績のカレンダーコンポーネントです。
 * @author shisyamo4131
 */
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import GCalendar from '../../atoms/calendars/GCalendar.vue'
import GChipDayType from '~/components/atoms/chips/GChipDayType.vue'
dayjs.extend(utc)

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GChipDayType, GCalendar },

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
    hide-default-header
    v-on="$listeners"
  >
    <template #day="{ date }">
      <div
        v-if="events[date]"
        class="container px-1 px-md-2 py-0"
        style="min-height: 72px"
      >
        <!-- dayType and attendanceStatus -->
        <div class="text-caption d-flex flex-column flex-md-row">
          <div>
            <g-chip-day-type
              x-small
              label
              :value="events[date].dayType"
              short
            />
          </div>
          <div class="ml-md-auto text-center text-md-left">
            {{ $ATTENDANCE_STATUS[events[date].attendanceStatus].short }}
            <v-tooltip top>
              <template #activator="{ attrs, on }">
                <v-icon
                  v-if="
                    events[date].attendanceStatus === 'present' &&
                    events[date].leaveRecord.docId &&
                    events[date].leaveRecord.leaveType !== 'substitute'
                  "
                  v-bind="attrs"
                  color="error"
                  small
                  v-on="on"
                  >mdi-alert-circle</v-icon
                >
              </template>
              休暇情報があります。
            </v-tooltip>
          </div>
        </div>
        <div v-if="events[date].attendanceStatus === 'present'">
          <!-- time -->
          <div class="text-caption">
            <div class="d-flex flex-column flex-md-row">
              <v-icon v-if="$vuetify.breakpoint.mdAndUp" left small
                >mdi-clock-outline</v-icon
              >
              <div class="text-center text-md-left">
                {{ events[date].startTimeFormatted }}
              </div>
              <div v-if="$vuetify.breakpoint.mdAndUp" class="mx-md-1">-</div>
              <div class="text-center text-md-left">
                {{ events[date].endTimeFormatted }}
              </div>
            </div>
          </div>
          <!-- minutes -->
          <div class="text-caption d-flex flex-column flex-md-row">
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
