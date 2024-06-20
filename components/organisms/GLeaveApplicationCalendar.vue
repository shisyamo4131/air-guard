<script>
import { where } from 'firebase/firestore'
import GCalendar from '../atoms/calendars/GCalendar.vue'
/**
 * ### GLeaveApplicationCalendar
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCalendar },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    employeeId: { type: String, required: true },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      model: {
        child: this.$EmployeeLeaveApplication(),
      },
      currentDate: this.$dayjs().format('YYYY-MM-DD'),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    events() {
      return this.items.map((item) => {
        return {
          name: this.$LEAVE_APPLICATION_TYPE[item.type],
          start: new Date(item.docId),
          color: 'secondary',
          data: item,
        }
      })
    },
    month() {
      return this.$dayjs(this.currentDate).format('YYYY-MM')
    },
    from() {
      return this.$dayjs(this.currentDate)
        .startOf('month')
        .startOf('week')
        .format('YYYY-MM-DD')
    },
    to() {
      return this.$dayjs(this.currentDate)
        .endOf('month')
        .endOf('week')
        .format('YYYY-MM-DD')
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    employeeId: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.model.child.employeeId = newVal
        this.subscribe()
      },
      immediate: true,
    },
    from(newVal, oldVal) {
      if (newVal === oldVal) return
      this.subscribe()
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.model.child.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    subscribe() {
      this.items = this.model.child.subscribe(undefined, [
        where('docId', '>=', this.from),
        where('docId', '<=', this.to),
      ])
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title"> 休暇申請 </v-card-title>
    <v-container fluid>
      <div class="d-flex mb-2 align-center" style="column-gap: 4px">
        <v-btn
          color="primary"
          small
          outlined
          @click="currentDate = $dayjs().format('YYYY-MM-DD')"
          >今月</v-btn
        >
        <v-btn icon @click="$refs.calendar.prev()"
          ><v-icon>mdi-chevron-left</v-icon></v-btn
        >
        <span>{{ month }}</span>
        <v-btn icon @click="$refs.calendar.next()"
          ><v-icon>mdi-chevron-right</v-icon></v-btn
        >
      </div>
      <div style="height: 480px">
        <g-calendar
          ref="calendar"
          v-model="currentDate"
          color="primary"
          :events="events"
        />
      </div>
    </v-container>
  </v-card>
</template>

<style></style>
