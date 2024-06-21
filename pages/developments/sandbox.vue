<template>
  <v-container>
    <v-simple-table>
      <thead>
        <tr>
          <th
            v-for="(day, index) of period"
            :key="index"
            style="min-width: 84px"
          >
            <div class="text-center">
              <div>{{ day.format('ddd') }}</div>
              <div>{{ day.format('D') }}</div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td
            v-for="(day, tdIndex) of period"
            :key="`td-${tdIndex}`"
            class="align-start"
          >
            <v-sheet
              v-if="computedEvents[day.format('YYYY-MM-DD')]"
              class="pa-1 d-flex flex-column"
              height="100%"
              style="row-gap: 4px"
            >
              <v-card
                v-for="(event, eventIndex) of computedEvents[
                  day.format('YYYY-MM-DD')
                ]"
                :key="eventIndex"
              >
                {{ event.name }}
              </v-card>
            </v-sheet>
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </v-container>
</template>

<script>
import dayjs from 'dayjs'
import ja from 'dayjs/locale/ja'
export default {
  props: {
    value: { type: String, default: undefined, required: false },
  },
  data() {
    return {
      currentDate: null,
      events: [
        { name: 'event1', start: '2024-06-22' },
        { name: 'event1', start: '2024-06-22' },
        { name: 'event1', start: '2024-06-22' },
        { name: 'event1', start: '2024-06-22' },
        { name: 'event1', start: '2024-06-22' },
        { name: 'event1', start: '2024-06-22' },
        { name: 'event1', start: '2024-06-22' },
        { name: 'event1', start: '2024-06-22' },
        { name: 'event1', start: '2024-06-22' },
        { name: 'event1', start: '2024-06-22' },
        { name: 'event1', start: '2024-06-22' },
        { name: 'event1', start: '2024-06-23' },
        { name: 'event1', start: '2024-06-22' },
        { name: 'event1', start: '2024-06-22' },
        { name: 'event1', start: '2024-06-22' },
      ],
    }
  },
  computed: {
    computedEvents() {
      return this.events.reduce((acc, i) => {
        if (!(i.start in acc)) acc[i.start] = []
        acc[i.start].push(i)
        return acc
      }, {})
    },
    period() {
      const from = this.currentDate
      const to = from.add(6, 'day')
      const result = []
      for (let day = from; day <= to; day = day.add(1, 'day')) {
        result.push(day)
      }
      return result
    },
  },
  watch: {
    value: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.currentDate = dayjs(newVal)
      },
      immediate: true,
    },
  },
  created() {
    dayjs.locale(ja)
    this.currentDate = dayjs()
  },
}
</script>

<style></style>
