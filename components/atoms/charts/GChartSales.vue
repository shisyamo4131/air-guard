<script>
import GChartBar from '~/components/atoms/charts/GChartBar.vue'
/**
 * ### BChartSales
 *
 * 売上高の棒グラフ（縦）コンポーネントです。
 * - DailySale ドキュメントの配列を props.items で受け取り、売上高を棒グラフで描画します。
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GChartBar },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 表示する月数です。
     */
    cols: { type: Number, default: 3, required: false },
    /**
     * 表示のメインとなる年月を YYYY-MM の形式で指定します。
     * 未指定の場合、現在の年月が対象となります。
     */
    month: {
      type: String,
      default: undefined,
      validator: (v) => {
        const regex = /^\d{4}-(0[1-9]|1[0-2])$/
        return regex.test(v)
      },
      required: false,
    },
    /**
     * グラフコンポーネントの高さです。
     */
    height: { type: Number, default: undefined, required: false },
    /**
     * DailySale ドキュメントの配列を受け取ります。
     */
    items: { type: Array, default: () => [], required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * chartjsのoption設定
       */
      options: {
        title: {
          display: true,
          text: '売上推移',
          fontSize: 14,
        },
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
              stacked: true,
              ticks: {
                beginAtZero: true,
                // Y軸の数字を3桁で区切る
                callback: function (label) {
                  return `${label.toLocaleString()}円`
                },
              },
            },
          ],
          xAxes: [
            {
              stacked: true,
            },
          ],
        },
        tooltips: {
          callbacks: {
            // ツールチップに表示される金額を3桁で区切り、属性ごとの割合を追加
            label: function (tooltipItem, data) {
              if (tooltipItem.datasetIndex === 0) {
                return `${tooltipItem.yLabel.toLocaleString()}人工`
              }
              // 属性ごとの合計値
              const currentValue = tooltipItem.yLabel

              // データセット全体の総合計を計算（"workers" 軸を持つ dataset を除外）
              const totalSum = data.datasets
                .filter((dataset, index) => dataset.yAxisID !== 'workers')
                .reduce((sum, dataset) => {
                  return (
                    sum +
                    dataset.data.reduce((dataSum, value) => dataSum + value, 0)
                  )
                }, 0)

              // 割合の計算
              const percentage = ((currentValue / totalSum) * 100).toFixed(2)

              // 結果を表示
              return `${currentValue.toLocaleString()}円 (${percentage}%)`
            },
            // ツールチップの下部に全データセットの総合計を表示
            footer: function (tooltipItems, data) {
              // datasetIndex が 0 のデータポイントが1つでも含まれている場合は、総合計を表示しない
              const containsDatasetIndexZero = tooltipItems.some(
                (item) => item.datasetIndex === 0
              )
              if (containsDatasetIndexZero) return ''

              // 総合計を計算
              const totalSum = data.datasets
                .filter((dataset) => dataset.yAxisID !== 'workers')
                .reduce((sum, dataset) => {
                  return (
                    sum +
                    dataset.data.reduce((dataSum, value) => dataSum + value, 0)
                  )
                }, 0)

              return `総合計: ${totalSum.toLocaleString()}円`
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
      const currentDate = this.month
        ? this.$dayjs(`${this.month}-01`)
        : this.$dayjs().startOf('month')
      return [...Array(this.cols)].map((_, i) =>
        currentDate.subtract(this.cols - (i + 1), 'month').format('YYYY-MM')
      )
    },
    /**
     * 月別の売上を警備区分別に集計し、結果を売上金額のみの配列で返します。
     */
    sales() {
      // Array.reduce()の初期値に使うオブジェクトを生成
      // 例）{ traffic: { '2024-01': 0, '2024-02': 0, '2024-03': 0 }, ...}
      // const securityTypes = ['traffic', 'jam', 'facility', 'patrol']
      const securityTypes = ['traffic', 'jam', 'facility', 'patrol', 'other']
      const defaultValue = Object.fromEntries(
        securityTypes.map((securityType) => [
          securityType,
          Object.fromEntries(this.months.map((i) => [i, 0])),
        ])
      )
      // Array.reduce()を使ってfetchしたsalesデータを集計
      // 例）{ traffic: { '2024-01': xxxxx, '2024-02': xxxxx, '2024-03': xxxxx }, ...}
      const result = this.items.reduce((sum, i) => {
        securityTypes.forEach((securityType) => {
          sum[securityType][i.month] += i.operationResults
            .filter((result) => result.securityType === securityType)
            .reduce((total, result) => {
              total = total + result.sales.total
              return total
            }, 0)
        })
        return sum
      }, defaultValue)
      // 集計結果のsecurityType毎の値を配列に変換
      Object.keys(result).forEach((key) => {
        result[key] = Object.values(result[key])
      })
      return result
    },
    /**
     * 月別の稼働数を集計し、稼働数のみの配列を返します。
     */
    workersData() {
      // Array.reduce()の初期値に使うオブジェクトを生成
      // 例）{ '2024-01': 0, '2024-02': 0, '2024-03': 0 }
      const defaultValue = Object.fromEntries(this.months.map((i) => [i, 0]))

      // Array.reduce()を使ってfetchしたsalesデータを集計
      // 例）{ '2024-01': 120, '2024-02': 153, '2024-03': 145 }
      const result = this.items.reduce((sum, dailyAttendance) => {
        // 該当月の合計に加算
        sum[dailyAttendance.month] += dailyAttendance.operationResults.reduce(
          (total, result) => total + result.operationCount.total,
          0
        )
        // 更新された sum を返す
        return sum
      }, defaultValue)
      // 集計結果を値のみの配列にして返す
      // 例）[ 1230943, 23947, 2349987 ]
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
            label: ['交通誘導警備'],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1,
            data: this.sales.traffic,
            yAxisID: 'sales',
          },
          {
            type: 'bar',
            label: ['雑踏警備'],
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderColor: 'rgb(255, 159, 64)',
            borderWidth: 1,
            data: this.sales.jam,
            yAxisID: 'sales',
          },
          {
            type: 'bar',
            label: ['施設警備'],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1,
            data: this.sales.facility,
            yAxisID: 'sales',
          },
          {
            type: 'bar',
            label: ['巡回警備'],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1,
            data: this.sales.patrol,
            yAxisID: 'sales',
          },
          {
            type: 'bar',
            label: ['その他'],
            backgroundColor: 'rgba(128, 128, 128, 0.2)',
            borderColor: 'rgb(128, 128, 128)',
            borderWidth: 1,
            data: this.sales.other,
            yAxisID: 'sales',
          },
        ],
      }
    },
  },
}
</script>

<template>
  <g-chart-bar
    :chart-data="chartData"
    :styles="{ height: '100%', width: '100%', position: 'relative' }"
    :options="options"
  />
</template>

<style></style>
