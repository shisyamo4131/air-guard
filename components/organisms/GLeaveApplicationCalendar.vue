<script>
import { collection, onSnapshot, query, where } from 'firebase/firestore'
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
      listener: null,
      value: this.$dayjs().format('YYYY-MM-DD'),
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
        }
      })
    },
    month() {
      return this.$dayjs(this.value).format('YYYY-MM')
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    employeeId: {
      handler(v) {
        this.subscribe()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    if (this.listener) this.listener()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    subscribe() {
      this.items.splice(0)
      const collectionId = `Employees/${this.employeeId}/EmployeeLeaveApplications`
      const colRef = collection(this.$firestore, collectionId)
      const q = query(colRef, where('months', 'array-contains', this.month))
      this.listener = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const item = change.doc.data()
          const index = this.items.findIndex(
            ({ docId }) => docId === change.doc.data().docId
          )
          if (change.type === 'added') this.items.push(item)
          if (change.type === 'modified') this.items.splice(index, 1, item)
          if (change.type === 'removed') this.items.splice(index, 1)
        })
      })
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title"> 休暇申請 </v-card-title>
    <v-container fluid>
      <div class="d-flex mb-2 align-center" style="column-gap: 4px">
        <v-btn icon @click="$refs.calendar.prev()"
          ><v-icon>mdi-chevron-left</v-icon></v-btn
        >
        <span>{{ month }}</span>
        <v-btn icon @click="$refs.calendar.next()"
          ><v-icon>mdi-chevron-right</v-icon></v-btn
        >
        <v-btn
          class="ml-auto"
          color="primary"
          small
          outlined
          @click="value = $dayjs().format('YYYY-MM-DD')"
          >今月</v-btn
        >
      </div>
      <div style="height: 480px">
        <g-calendar
          ref="calendar"
          v-model="value"
          color="primary"
          :events="events"
        />
      </div>
    </v-container>
  </v-card>
</template>

<style></style>
