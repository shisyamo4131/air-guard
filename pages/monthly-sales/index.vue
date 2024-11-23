<script>
import { getApp } from 'firebase/app'
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
import GChartSales from '~/components/atoms/charts/GChartSales.vue'
import DailySale from '~/models/DailySale'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'MonthlySales',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDialogMonthPicker, GChartSales, GTemplateDefault, GDataTable },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      listener: new DailySale(),
      loading: false,
      // month: this.$dayjs().format('YYYY-MM'),
      month: '2024-10',
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    salesTop5() {
      return [...this.salesByCustomer]
        .sort((a, b) => b.totalSales.thisMonth - a.totalSales.thisMonth)
        .slice(0, 5)
    },

    status() {
      const lastExecutedAt =
        this.$store.state.systems?.calcMonthlySales?.lastExecutedAt || null
      if (!lastExecutedAt) return null
      const result = this.$dayjs(lastExecutedAt).format('YYYY-MM-DD HH:mm:ss')
      return result
    },

    salesByCustomer() {
      // customers をオブジェクトとして取得
      const customers = this.$store.getters['customers/items'].reduce(
        (map, { docId, ...customer }) => {
          map[docId] = customer
          return map
        },
        {}
      )

      // 当該月と先月の稼働実績データを抽出
      const thisMonthResults = this.items
        .filter(({ month }) => month === this.month)
        .flatMap((item) => item.operationResults || [])

      const lastMonth = this.$dayjs(this.month)
        .subtract(1, 'month')
        .format('YYYY-MM')
      const lastMonthResults = this.items
        .filter(({ month }) => month === lastMonth)
        .flatMap((item) => item.operationResults || [])

      // 取引先ごとに売上と稼働数を集計するヘルパー関数
      const aggregateResults = (results, label, acc) => {
        results.forEach(({ customerId, sales, operationCount }) => {
          if (!customerId) return // 無効なデータをスキップ

          // 取引先ごとの集計オブジェクトを初期化
          if (!acc[customerId]) {
            acc[customerId] = {
              customerId,
              totalSales: { thisMonth: 0, lastMonth: 0 },
              totalOperations: { thisMonth: 0, lastMonth: 0 },
              customer: customers[customerId] || null,
            }
          }

          // 売上を加算
          if (sales) {
            acc[customerId].totalSales[label] += sales.total || 0
          }

          // 稼働数を加算
          if (operationCount) {
            acc[customerId].totalOperations[label] += operationCount.total || 0
          }
        })

        return acc
      }

      // 売上と稼働数を集計
      const aggregatedData = {}
      aggregateResults(thisMonthResults, 'thisMonth', aggregatedData)
      aggregateResults(lastMonthResults, 'lastMonth', aggregatedData)

      // 結果を配列に変換
      return Object.values(aggregatedData)
    },

    isCalculating() {
      return this.$store.state.systems.calcMonthlySales?.status !== 'ready'
    },

    /**
     * 集計対象の年月
     */
    months() {
      const currentDate = this.month
        ? this.$dayjs(`${this.month}-01`)
        : this.$dayjs().startOf('month')
      return [...Array(6)].map((_, i) =>
        currentDate.subtract(6 - (i + 1), 'month').format('YYYY-MM')
      )
    },

    monthlyTotal() {
      return this.salesByCustomer.reduce(
        (acc, i) => {
          acc.totalSales.thisMonth += i.totalSales.thisMonth
          acc.totalSales.lastMonth += i.totalSales.lastMonth
          acc.totalOperations.thisMonth += i.totalOperations.thisMonth
          acc.totalOperations.lastMonth += i.totalOperations.lastMonth
          return acc
        },
        {
          totalSales: { thisMonth: 0, lastMonth: 0 },
          totalOperations: { thisMonth: 0, lastMonth: 0 },
        }
      )
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    month: {
      handler(v) {
        this.subscribe()
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    subscribe() {
      this.items = this.listener.subscribeDocs([
        ['where', 'month', 'in', this.months],
      ])
    },
    unsubscribe() {
      this.listener.unsubscribe()
    },
    /**
     * 月次売上更新処理
     */
    async recalc() {
      this.loading = true
      try {
        this.unsubscribe()
        const firebaseApp = getApp()
        const functions = getFunctions(firebaseApp, 'asia-northeast1')
        if (process.env.NODE_ENV === 'local') {
          connectFunctionsEmulator(functions, 'localhost', 5001)
        }
        const func = httpsCallable(functions, 'maintenance-refreshMonthlySales')
        const result = await func({ month: this.month })
        console.info(result.data.message) // eslint-disable-line no-console
      } catch (err) {
        console.error('Error calling function:', err) // eslint-disable-line no-console
      } finally {
        this.subscribe()
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <g-template-default>
    <v-container>
      <v-card outlined>
        <v-toolbar flat>
          <g-dialog-month-picker v-model="month">
            <template #activator="{ attrs, on }">
              <v-text-field
                v-bind="attrs"
                class="center-input"
                style="max-width: 120px"
                flat
                dense
                hide-details
                :disabled="isCalculating"
                v-on="on"
              />
            </template>
          </g-dialog-month-picker>
          <v-toolbar-items>
            <v-btn
              color="primary"
              class="ml-4"
              :disabled="isCalculating || loading"
              :loading="isCalculating || loading"
              text
              @click="recalc"
              >実績更新</v-btn
            >
          </v-toolbar-items>
          <v-spacer />
        </v-toolbar>
        <div class="px-4 text-right text-subtitle-2">
          {{ `最終更新日時: ${status}` }}
        </div>
        <v-container>
          <v-row>
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="flex-grow-1">
                <v-card-title>売上推移</v-card-title>
                <div>
                  <g-chart-sales :items="items" :month="month" />
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="6" class="d-flex">
              <v-card outlined class="flex-grow-1">
                <v-card-title>売上TOP5</v-card-title>
                <g-data-table
                  :headers="[
                    { text: '取引先', value: 'customerId' },
                    {
                      text: '売上高',
                      value: 'totalSales.thisMonth',
                      align: 'right',
                    },
                  ]"
                  :items="salesTop5"
                  disable-sort
                >
                  <template #[`item.customerId`]="{ item }">
                    {{ $store.getters['customers/get'](item.customerId).abbr }}
                  </template>
                  <template #[`item.totalSales.thisMonth`]="{ item }">
                    {{ item.totalSales.thisMonth.toLocaleString() }}
                  </template>
                </g-data-table>
              </v-card>
            </v-col>
            <v-col cols="12">
              <v-card outlined>
                <v-card-title>取引先別売上高</v-card-title>
                <g-data-table
                  :headers="[
                    { text: 'CODE', value: 'customer.code' },
                    { text: '取引先', value: 'customerId' },
                    {
                      text: '売上高',
                      value: 'totalSales.thisMonth',
                      align: 'right',
                    },
                    {
                      text: '稼働数',
                      value: 'totalOperations.thisMonth',
                      align: 'right',
                    },
                  ]"
                  :items="salesByCustomer"
                  :items-per-page="-1"
                  sort-by="customer.code"
                >
                  <template #[`item.customerId`]="{ item }">
                    {{ $store.getters['customers/get'](item.customerId).abbr }}
                  </template>
                  <template #[`item.totalSales.thisMonth`]="{ item }">
                    <div>{{ item.totalSales.thisMonth.toLocaleString() }}</div>
                    <div class="grey--text">
                      {{ `(${item.totalSales.lastMonth.toLocaleString()})` }}
                    </div>
                  </template>
                  <template #[`item.totalOperations.thisMonth`]="{ item }">
                    <div>
                      {{ item.totalOperations.thisMonth.toLocaleString() }}
                    </div>
                    <div class="grey--text">
                      {{
                        `(${item.totalOperations.lastMonth.toLocaleString()})`
                      }}
                    </div>
                  </template>
                  <template #[`body.append`]="{ headers }">
                    <tr>
                      <th :colspan="headers.length - 2">合計</th>
                      <th :style="{ 'text-align': headers[2].align }">
                        <div class="text-body-2 font-weight-bold">
                          {{
                            monthlyTotal.totalSales.thisMonth.toLocaleString()
                          }}
                        </div>
                        <div class="grey--text">
                          {{
                            `(${monthlyTotal.totalSales.lastMonth.toLocaleString()})`
                          }}
                        </div>
                      </th>
                      <th :style="{ 'text-align': headers[3].align }">
                        <div class="text-body-2 font-weight-bold">
                          {{
                            monthlyTotal.totalOperations.thisMonth.toLocaleString()
                          }}
                        </div>
                        <div class="grey--text">
                          {{
                            `(${monthlyTotal.totalOperations.lastMonth.toLocaleString()})`
                          }}
                        </div>
                      </th>
                    </tr>
                  </template>
                </g-data-table>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-container>
  </g-template-default>
</template>

<style></style>
