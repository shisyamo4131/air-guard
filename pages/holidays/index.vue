<script>
import { database } from 'air-firebase'
import { onValue, ref } from 'firebase/database'
import GTemplateFixed from '~/components/templates/GTemplateFixed.vue'
import GCalendar from '~/components/atoms/calendars/GCalendar.vue'
export default {
  name: 'HolidaysIndex',
  components: { GTemplateFixed, GCalendar },
  data() {
    return {
      data: null,
      date: this.$dayjs().format('YYYY-MM-DD'),
      listener: null,
    }
  },
  computed: {
    events() {
      if (!this.data) return []
      return Object.values(this.data).map(({ date, name }) => {
        return {
          start: date,
          name,
          color: 'red lighten-2',
        }
      })
    },
    month() {
      return this.date.slice(0, 7)
    },
    year() {
      return this.date.slice(0, 4)
    },
  },
  watch: {
    month: {
      handler() {
        this.subscribe()
      },
      immediate: true,
    },
  },
  methods: {
    unsubscribe() {
      if (this.listener) this.listener()
    },
    subscribe() {
      const dbRef = ref(database, `Holidays/${this.year}/${this.month}`)
      this.listener = onValue(dbRef, (snapshot) => {
        this.data = snapshot.val()
      })
    },
    async refresh() {
      await this.$holiday.fetchAndSaveHolidays(this.year)
    },
  },
}
</script>

<template>
  <g-template-fixed v-slot="{ height }">
    <v-container class="pa-0 pa-md-3" :style="{ height: `${height}px` }">
      <v-card
        flat
        height="100%"
        class="d-flex flex-column"
        :tile="$vuetify.breakpoint.mobile"
      >
        <v-toolbar class="flex-grow-0" color="secondary" dark dense flat>
          <v-icon left>mdi-flag</v-icon>
          <v-toolbar-title>祝日設定</v-toolbar-title>
          <v-spacer />
          <v-toolbar-items>
            <v-btn text @click="refresh">更新</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="pa-0 pa-md-4 flex-grow-1">
          <g-calendar v-model="date" style="height: 100%" :events="events" />
        </v-card-text>
      </v-card>
    </v-container>
  </g-template-fixed>
</template>

<style></style>
