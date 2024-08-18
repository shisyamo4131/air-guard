<template>
  <v-container>
    <v-simple-table class="site-operation-schedule-spread">
      <thead>
        <tr>
          <th>現場名</th>
          <th v-for="day in days" :key="day.key">
            {{ day.dayJp }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            {{ $store.getters['sites/get'](siteId)?.abbr || '' }}
          </td>
          <g-td-site-operation-schedule
            v-for="day in days"
            :key="day.key"
            :date="day.date"
            :site-id="siteId"
          />
        </tr>
      </tbody>
    </v-simple-table>
  </v-container>
</template>

<script>
import {
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  ref,
} from 'firebase/database'
import ja from 'dayjs/locale/ja'
import GTdSiteOperationSchedule from '~/components/molecules/tds/GTdSiteOperationSchedule.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTdSiteOperationSchedule },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app }) {
    const index = []
    const indexRef = ref(app.$database, 'SiteOperationSchedules/index')
    const listeners = {
      indexAdded: onChildAdded(indexRef, (snapshot) => {
        index.push(snapshot.val())
      }),
      indexChanged: onChildChanged(indexRef, (snapshot) => {
        const idx = index.findIndex(snapshot.val())
        if (idx !== -1) index.splice(idx, 1, snapshot.val())
      }),
      indexRemoved: onChildRemoved(indexRef, (snapshot) => {
        const idx = index.findIndex(snapshot.val())
        if (idx !== -1) index.aplice(idx, 1)
      }),
    }
    return { index, listeners }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      displayMonth: '2024-07',
      siteId: 'KFLWoTljBjmlDbGi992A',
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * ループ処理に使用する日付に関するオブジェクトデータを格納した配列を返します。
     * - `data.displayMonth`の月の日をすべて含みます。
     */
    days() {
      const daysInMonth = this.$dayjs(`${this.displayMonth}-01`).daysInMonth()
      const result = Array.from({ length: daysInMonth }, (_, index) => {
        const dateStr = `${this.displayMonth}-${('00' + (index + 1)).slice(-2)}`
        const currentDate = this.$dayjs(dateStr)
        return {
          key: index,
          date: currentDate.format('YYYY-MM-DD'),
          dayJp: currentDate.locale(ja).format('DD(ddd)'),
          dayOfWeek: currentDate.day(),
        }
      })
      return result
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    Object.keys(this.listeners).forEach((key) => {
      if (this.listeners[key]) this.listeners[key]()
      this.listeners[key] = null
    })
  },
}
</script>

<style>
.site-operation-schedule-spread th:first-child {
  min-width: 144px;
}
.site-operation-schedule-spread th:nth-child(n + 2) {
  text-align: center !important;
  min-width: 72px;
}
</style>
