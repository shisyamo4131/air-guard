<template>
  <v-container fluid>
    <!-- <v-row justify="center" align="center"> -->
    <v-row>
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="g-card__title">取極め未登録現場</v-card-title>
          <v-card-subtitle>
            取極めが登録されていない現場があります。
          </v-card-subtitle>
          <g-data-table-sites
            :items="items.noContractSites"
            :items-per-page="5"
          />
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="g-card__title"> 雇用期間満了間近 </v-card-title>
          <v-card-subtitle>
            1ヶ月以内に契約期間満了を迎える従業員がいます。
          </v-card-subtitle>
          <v-card-text>
            <v-chip-group>
              <v-chip
                v-for="(contract, index) of $store.getters[
                  'employee-contracts/expiringSoon'
                ]"
                :key="index"
                color="warning"
                class="black--text"
                @click="$router.push(`employees/${contract.employeeId}`)"
              >
                {{ contract.employee.abbr }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="8" xl="5">
        <g-launcher-attendance-records flat outlined />
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
import GDataTableSites from '~/components/molecules/tables/GDataTableSites.vue'
import GLauncherAttendanceRecords from '~/components/organisms/GLauncherAttendanceRecords.vue'
import Site from '~/models/Site'
// import BChartSales from '~/components/molecules/charts/BChartSales.vue'

export default {
  name: 'IndexPage',
  components: {
    // BChartSales,
    GLauncherAttendanceRecords,
    GDataTableSites,
  },
  data() {
    return {
      date: this.$dayjs().format('YYYY-MM-DD'),
      listeners: {
        noContractSites: new Site(),
      },
      items: {
        noContractSites: [],
      },
      tab: 0,
    }
  },
  mounted() {
    this.items.noContractSites = this.listeners.noContractSites.subscribeDocs([
      ['where', 'hasContract', '==', false],
    ])
  },
  destroyed() {
    this.listeners.noContractSites.unsubscribe()
  },
}
</script>
