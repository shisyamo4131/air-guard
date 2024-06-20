<script>
// import { where } from 'firebase/firestore'
import GCalendar from '../atoms/calendars/GCalendar.vue'
import GDivMonthChooser from '../molecules/divs/GDivMonthChooser.vue'
/**
 * ### GLauncherTemporarySiteOperationSchedules
 * @author shisyamo4131
 * @create 2024-06-14
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCalendar,
    GDivMonthChooser,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    height: { type: [String, Number], default: undefined, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      currentDate: this.$dayjs().format('YYYY-MM-DD'),
      items: [],
      model: this.$SiteOperationSchedule(),
      type: 'month',
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    daySchedules() {
      if (!this.selectedDate) return []
      return this.items.filter(({ date }) => date === this.selectedDate)
    },
    events() {
      return this.items.reduce((acc, i) => {
        const date = i.date
        if (!(date in acc)) acc[date] = { day: 0, night: 0, total: 0 }
        acc[date][i.workShift] += i.requiredWorkers
        acc[date][i.total] += i.requiredWorkders
        return acc
      }, {})
    },
    from() {
      const result = this.$dayjs(this.currentDate)
        .startOf('month')
        .startOf('week')
        .format('YYYY-MM-DD')
      return result
    },
    to() {
      const result = this.$dayjs(this.currentDate)
        .endOf('month')
        .endOf('week')
        .format('YYYY-MM-DD')
      return result
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    currentDate: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.subscribe()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.model.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    subscribe() {
      this.items = this.model.subscribeGroupAsEvent({
        from: this.from,
        to: this.to,
        temporary: true,
      })
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title">
      スポット現場情報
      <v-spacer />
      <v-btn
        icon
        color="primary"
        @click="$router.push('temporary-site-schedules')"
        ><v-icon>mdi-open-in-new</v-icon></v-btn
      >
    </v-card-title>

    <v-container fluid class="py-0">
      <g-div-month-chooser
        v-model="currentDate"
        @click:prev="$refs.calendar.prev()"
        @click:next="$refs.calendar.next()"
      />
    </v-container>
    <v-container fluid>
      <div :style="{ height: `${height ? parseInt(height) : undefined}px` }">
        <g-calendar ref="calendar" v-model="currentDate" :type="type">
          <template #day="{ date }">
            <div
              v-if="events[date]"
              class="d-flex flex-wrap pa-1"
              style="gap: 4px"
            >
              <div style="height: 20px; width: 100%">
                <v-sheet
                  v-if="events[date].day > 0"
                  color="blue lighten-2"
                  width="100%"
                  height="100%"
                  rounded
                  class="d-flex align-center justify-center white--text"
                >
                  {{ events[date].day }}
                </v-sheet>
              </div>
              <div style="height: 20px; width: 100%">
                <v-sheet
                  v-if="events[date].night > 0"
                  color="red lighten-2"
                  width="100%"
                  height="100%"
                  rounded
                  class="d-flex align-center justify-center white--text"
                >
                  {{ events[date].night }}
                </v-sheet>
              </div>
            </div>
          </template>
        </g-calendar>
      </div>
    </v-container>
  </v-card>
</template>

<style></style>
