<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12">
        <v-card>
          <v-card-title> 売上推移 </v-card-title>
          <v-card-text>
            <b-chart-sales :height="300" date="2024-04-01" :count="4" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title> 男女構成 </v-card-title>
          <v-card-text>
            <v-simple-table>
              <tbody>
                <tr>
                  <td>男性</td>
                  <td>{{ $store.getters['employees/male'] }}</td>
                </tr>
                <tr>
                  <td>女性</td>
                  <td>{{ $store.getters['employees/female'] }}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import BChartSales from '~/components/molecules/charts/BChartSales.vue'

export default {
  name: 'IndexPage',
  components: { BChartSales },
  data() {
    return {}
  },
}
</script>
