<template>
  <v-container>
    <v-row justify="center" align="center">
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
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title> 売上 </v-card-title>
          <v-card-text>
            <v-simple-table>
              <tbody>
                <tr>
                  <td>2024年01月</td>
                  <td align="right">
                    {{ (items.sales?.['2024-01'] || 0).toLocaleString() }}
                  </td>
                </tr>
                <tr>
                  <td>2024年02月</td>
                  <td align="right">
                    {{ (items.sales?.['2024-02'] || 0).toLocaleString() }}
                  </td>
                </tr>
                <tr>
                  <td>2024年03月</td>
                  <td align="right">
                    {{ (items.sales?.['2024-03'] || 0).toLocaleString() }}
                  </td>
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
import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore'
export default {
  name: 'IndexPage',
  data() {
    return {
      items: {
        sales: null,
      },
      listeners: {
        sales: null,
      },
    }
  },
  mounted() {
    this.subscribeSales()
  },
  destroyed() {
    this.unsubscribeSales()
  },
  methods: {
    subscribeSales() {
      const colRef = collectionGroup(this.$firestore, 'SiteMonthlySales')
      const q = query(
        colRef,
        where('month', 'in', ['2024-01', '2024-02', '2024-03'])
      )
      this.listeners.sales = onSnapshot(q, (querySnapshot) => {
        this.items.sales = querySnapshot.docs
          .map((doc) => doc.data())
          .reduce(
            (sum, i) => {
              sum[i.month] = sum[i.month] + i.total
              return sum
            },
            { '2024-01': 0, '2024-02': 0, '2024-03': 0 }
          )
      })
    },
    unsubscribeSales() {
      if (this.listeners.sales) this.listeners.sales()
      this.listeners.sales = null
    },
  },
}
</script>
