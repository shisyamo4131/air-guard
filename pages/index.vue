<template>
  <v-container fluid>
    <!-- <v-row justify="center" align="center"> -->
    <v-row>
      <v-col cols="12" md="8" lg="8">
        <g-launcher-attendance-records />
      </v-col>
      <v-col cols="12" md="4" lg="4">
        <g-launcher-leave-applications />
      </v-col>
      <v-col cols="12">
        <g-temporary-site-calendar flat outlined height="360" />
      </v-col>
      <!-- <v-col cols="12">
        <v-card>
          <v-card-title> 売上推移 </v-card-title>
          <v-card-text>
            <b-chart-sales :height="300" :date="date" :count="4" />
          </v-card-text>
        </v-card>
      </v-col> -->
      <!-- <v-col cols="12" sm="8" md="4">
        <v-card flat outlined>
          <v-card-title class="g-card__title"> 男女構成 </v-card-title>
          <v-simple-table>
            <thead>
              <tr>
                <th>男性</th>
                <th>女性</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ $store.getters['employees/male'] }}</td>
                <td>{{ $store.getters['employees/female'] }}</td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card>
      </v-col> -->
    </v-row>
  </v-container>
</template>

<script>
import GLauncherAttendanceRecords from '~/components/organisms/GLauncherAttendanceRecords.vue'
import GLauncherLeaveApplications from '~/components/organisms/GLauncherLeaveApplications.vue'
// import BChartSales from '~/components/molecules/charts/BChartSales.vue'
import GTemporarySiteCalendar from '~/components/organisms/GTemporarySiteCalendar.vue'

export default {
  name: 'IndexPage',
  components: {
    // BChartSales,
    GTemporarySiteCalendar,
    GLauncherLeaveApplications,
    GLauncherAttendanceRecords,
  },
  data() {
    return {
      date: this.$dayjs().format('YYYY-MM-DD'),
      tab: 0,
    }
  },
}
</script>
