<script>
/**
 * 月間売上用 DataTable コンポーネント
 * @author shisyamo4131
 */
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * DailySales ドキュメント配列
     */
    items: { type: Array, default: () => [], required: false },
    /**
     * 表示年月
     */
    month: { type: String, required: true },
    /**
     * 表示タイプ
     */
    type: {
      type: String,
      default: 'all',
      validator: (v) => ['all', 'top5'].includes(v),
      required: false,
    },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      return [
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
      ]
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
    salesTop5() {
      return [...this.salesByCustomer]
        .sort((a, b) => b.totalSales.thisMonth - a.totalSales.thisMonth)
        .slice(0, 5)
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
}
</script>

<template>
  <g-data-table
    v-bind="$attrs"
    :headers="headers"
    :items="type === 'all' ? salesByCustomer : salesTop5"
    :items-per-page="-1"
    :sort-by="type === 'all' ? 'customer.code' : 'totalSales.thisMonth'"
    :sort-desc="type === 'all' ? false : true"
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
        {{ `(${item.totalOperations.lastMonth.toLocaleString()})` }}
      </div>
    </template>
    <template v-if="type === 'all'" #[`body.append`]="props">
      <tr>
        <th :colspan="props.headers.length - 2">合計</th>
        <th :style="{ 'text-align': props.headers[2].align }">
          <div class="text-body-2 font-weight-bold">
            {{ monthlyTotal.totalSales.thisMonth.toLocaleString() }}
          </div>
          <div class="grey--text">
            {{ `(${monthlyTotal.totalSales.lastMonth.toLocaleString()})` }}
          </div>
        </th>
        <th :style="{ 'text-align': props.headers[3].align }">
          <div class="text-body-2 font-weight-bold">
            {{ monthlyTotal.totalOperations.thisMonth.toLocaleString() }}
          </div>
          <div class="grey--text">
            {{ `(${monthlyTotal.totalOperations.lastMonth.toLocaleString()})` }}
          </div>
        </th>
      </tr>
    </template>
  </g-data-table>
</template>

<style></style>
