<script>
import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore'
import AChartBar from '~/components/atoms/charts/AChartBar.vue'
/**
 * ### BChartSales
 *
 * 売上高の棒グラフ（縦）コンポーネントです。
 * props.dateを指定すると、当月から遡ってprops.countで指定された月数分の
 * 売上高を棒グラフで描画します。
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { AChartBar },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    count: { type: Number, default: 3, required: false },
    date: { type: String, default: undefined, required: false },
    height: { type: Number, default: undefined, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      listener: null,
      /**
       * chartjsのoption設定
       */
      options: {
        scales: {
          yAxes: [
            {
              id: 'workers',
              position: 'right',
              gridLines: {
                drawOnChartArea: false,
              },
              ticks: {
                beginAtZero: true,
                // Y軸の数字を3桁で区切る
                callback: function (label) {
                  return `${label.toLocaleString()}人工`
                },
              },
            },
            {
              id: 'sales',
              ticks: {
                beginAtZero: true,
                // Y軸の数字を3桁で区切る
                callback: function (label) {
                  return `${label.toLocaleString()}円`
                },
              },
            },
          ],
        },
        tooltips: {
          callbacks: {
            // ツールチップに表示される金額を3桁で区切る
            label: function (tooltipItem, data) {
              const suffix = tooltipItem.datasetIndex === 0 ? '人工' : '円'
              return `${tooltipItem.yLabel.toLocaleString()}${suffix}`
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * 集計対象の年月
     */
    months() {
      const currentDate = this.date ? this.$dayjs(this.date) : this.$dayjs()
      return [...Array(this.count)].map((_, i) =>
        currentDate.subtract(this.count - (i + 1), 'month').format('YYYY-MM')
      )
    },
    /**
     * 売上高のデータ
     */
    salesData() {
      // Array.reduce()の初期値に使うオブジェクトを生成
      // 例）{ '2024-01': 0, '2024-02': 0, '2024-03': 0 }
      const defaultValue = Object.fromEntries(this.months.map((i) => [i, 0]))
      // Array.reduce()を使ってfetchしたsalesデータを集計
      // 例）{ '2024-01': 1230943, '2024-02': 23947, '2024-03': 2349987 }
      const result = this.items.reduce((sum, i) => {
        sum[i.month] = sum[i.month] + i.total
        return sum
      }, defaultValue)
      // 集計結果を値のみの配列にして返す
      // 例）[1230943, 23947, 2349987 ]
      return Object.values(result)
    },
    workersData() {
      // Array.reduce()の初期値に使うオブジェクトを生成
      // 例）{ '2024-01': 0, '2024-02': 0, '2024-03': 0 }
      const defaultValue = Object.fromEntries(this.months.map((i) => [i, 0]))
      // Array.reduce()を使ってfetchしたsalesデータを集計
      // 例）{ '2024-01': 120, '2024-02': 153, '2024-03': 145 }
      const result = this.items
        .filter(({ total }) => !!total)
        .reduce((sum, i) => {
          const workers =
            i.workers.normal +
            i.workers.half +
            i.workers.canceled +
            i.workersQualified.normal +
            i.workersQualified.half +
            i.workersQualified.canceled
          sum[i.month] = sum[i.month] + workers
          return sum
        }, defaultValue)
      // 集計結果を値のみの配列にして返す
      // 例）[1230943, 23947, 2349987 ]
      return Object.values(result)
    },
    /**
     * chartjsに渡すchartData
     */
    chartData() {
      return {
        labels: this.months,
        datasets: [
          {
            type: 'line',
            label: ['稼働数'],
            backgroundColor: '#FFCDD2',
            borderColor: '#E53935',
            borderWidth: 1,
            data: this.workersData,
            fill: false,
            yAxisID: 'workers',
          },
          {
            type: 'bar',
            label: ['売上高'],
            backgroundColor: '#BBDEFB',
            borderColor: '#2196F3',
            borderWidth: 1,
            data: this.salesData,
            yAxisID: 'sales',
          },
        ],
      }
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    date: {
      handler(v) {
        this.unsubscribe()
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
      const colRef = collectionGroup(this.$firestore, 'SiteMonthlySales')
      const q = query(colRef, where('month', 'in', this.months))
      this.listener = onSnapshot(q, (querySnapshot) => {
        this.items = querySnapshot.docs.map((doc) => doc.data())
      })
    },
    unsubscribe() {
      if (this.listener) this.listener()
      this.listener = null
    },
  },
}
</script>

<template>
  <a-chart-bar :chart-data="chartData" :height="height" :options="options" />
</template>

<style></style>
